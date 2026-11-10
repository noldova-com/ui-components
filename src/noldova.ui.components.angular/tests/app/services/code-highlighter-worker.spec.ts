/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeTokenKind } from "../../../src/app/enums/code-token-kind";
import { CodeWorkerMessageKind } from "../../../src/app/enums/code-worker-message-kind";
import { CodeHighlighterTokens } from "../../../src/app/models/code-highlighter-tokens";
import { CodeToken } from "../../../src/app/models/code-token";
import { CodeTokenizer } from "../../../src/app/models/code-tokenizer";
import { provideCodeHighlightingWorker } from "../../../src/app/services/provide-code-highlighting-worker";
import { CodeHighlighterWorkerFixture } from "../../fixtures/code-highlighter-worker.fixture";
import { CodeWorkerStartFixture } from "../../fixtures/code-worker.fixture";

describe("CodeHighlighter with a highlighting worker", () => {
  const { signal, json, off, sent } = CodeHighlighterWorkerFixture;
  let bed: CodeHighlighterWorkerFixture;

  beforeEach(() => {
    bed = new CodeHighlighterWorkerFixture();
  });

  afterEach(() => vi.restoreAllMocks());

  it("starts the worker the app provides, and none when the app provides none", () => {
    const start = (): Worker => {
      throw off;
    };
    const none = TestBed.inject(CodeHighlighterTokens.worker);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideCodeHighlightingWorker(start)] });

    expect([none, TestBed.inject(CodeHighlighterTokens.worker)]).toEqual([null, start]);
  });

  it("tokenizes in the worker with its time limit, starting no tokenizer on the page, and keeps the tokens to give again at once", async () => {
    const starts = new CodeWorkerStartFixture();
    const highlighter = bed.serve(starts.start);

    const tokens = await highlighter.tokensAsync("{ \"a\": 1 }", json, signal);
    const again = [highlighter.tokens("{ \"a\": 1 }", json), await highlighter.tokensAsync("{ \"a\": 1 }", json, signal)];

    expect(tokens.length).toBeGreaterThan(0);
    expect(again).toEqual([tokens, tokens]);
    expect([bed.loadedOnPage(highlighter), sent(starts.started[0]), starts.started[0]?.requests[0]?.timeLimit]).toEqual([false, [[CodeWorkerMessageKind.Tokenize, json.id, "{ \"a\": 1 }"]], 0]);
  });

  it("starts the worker at its first request, not when it is made", () => {
    const starts = new CodeWorkerStartFixture();
    const highlighter = bed.serve(starts.start);
    const before = starts.started.length;

    void highlighter.tokensAsync("1", json, signal);

    expect([before, starts.started.length]).toEqual([0, 1]);
  });

  it("cancels a request in the worker when its call is aborted, gives it nothing and keeps nothing, and sends nothing for a call aborted before it starts", async () => {
    const starts = new CodeWorkerStartFixture(false);
    const highlighter = bed.serve(starts.start);
    const controller = new AbortController();

    const tokens = highlighter.tokensAsync("1", json, controller.signal);
    controller.abort();
    const aborted = await tokens;
    const late = await highlighter.tokensAsync("2", json, controller.signal);

    expect([aborted, late, highlighter.tokens("1", json)]).toEqual([[], [], undefined]);
    expect(starts.started[0]?.requests.map(t => [t.kind, t.id])).toEqual([[CodeWorkerMessageKind.Tokenize, 0], [CodeWorkerMessageKind.Cancel, 0]]);
  });

  it("reports a grammar the worker failed to load once, leaves code plain and keeps nothing while the worker holds the failure, and keeps the worker", async () => {
    const failure = new Error("The grammar did not load.");
    vi.spyOn(CodeTokenizer.prototype, "loadAsync").mockRejectedValueOnce(failure);
    const starts = new CodeWorkerStartFixture();
    const highlighter = bed.serve(starts.start);

    const plain = [await highlighter.tokensAsync("1", json, signal), await highlighter.tokensAsync("1", json, signal)];

    expect([plain, highlighter.tokens("1", json), bed.messages()]).toEqual([[[], []], undefined, [[failure.message, failure]]]);
    expect([bed.loadedOnPage(highlighter), starts.started.map(t => t.isTerminated)]).toEqual([false, [false]]);
  });

  it("stops the worker with its injector, giving a call in flight nothing and reporting nothing", async () => {
    const starts = new CodeWorkerStartFixture(false);
    const highlighter = bed.serve(starts.start);
    const tokens = highlighter.tokensAsync("1", json, signal);

    TestBed.resetTestingModule();

    await expect(tokens).resolves.toEqual([]);
    expect([starts.started.map(t => t.isTerminated), bed.errors]).toEqual([[true], []]);
  });

  it("reports a grammar failure the worker met for a request cancelled while the grammar loaded, once", async () => {
    const failure = new Error("The grammar did not load.");
    vi.spyOn(CodeTokenizer.prototype, "loadAsync").mockRejectedValueOnce(failure);
    const starts = new CodeWorkerStartFixture();
    const highlighter = bed.serve(starts.start);
    const controller = new AbortController();

    const tokens = highlighter.tokensAsync("1", json, controller.signal);
    controller.abort();
    const cancelled = await tokens;
    await vi.waitFor(() => expect(bed.errors.length).toBe(1), { interval: 1 });
    const held = await highlighter.tokensAsync("1", json, signal);

    expect([cancelled, held, bed.messages()]).toEqual([[], [], [[failure.message, failure]]]);
  });

  it("ignores tokens, and a held failure, for a request it no longer waits for", async () => {
    const starts = new CodeWorkerStartFixture(false);
    const highlighter = bed.serve(starts.start);
    const tokens = highlighter.tokensAsync("1", json, signal);

    starts.started[0]?.answer({ kind: CodeWorkerMessageKind.Tokens, id: 7, tokens: [[0, 1, CodeTokenKind.Number]], error: null });
    starts.started[0]?.answer({ kind: CodeWorkerMessageKind.Failed, id: 8, tokens: [], error: null });
    starts.started[0]?.answer({ kind: CodeWorkerMessageKind.Tokens, id: 0, tokens: [[0, 1, CodeTokenKind.Number]], error: null });

    expect([await tokens, bed.errors]).toEqual([[new CodeToken(0, "1", CodeTokenKind.Number)], []]);
  });

  it("reports nothing for a grammar failure the worker sends as its injector goes", async () => {
    const starts = new CodeWorkerStartFixture(false);
    const highlighter = bed.serve(starts.start);
    const tokens = highlighter.tokensAsync("1", json, signal);

    starts.started[0]?.answer({ kind: CodeWorkerMessageKind.Failed, id: 0, tokens: [], error: new Error("The grammar did not load.") });
    TestBed.resetTestingModule();

    await expect(tokens).resolves.toEqual([]);
    expect(bed.errors).toEqual([]);
  });
});
