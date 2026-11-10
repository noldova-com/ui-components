/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeWorkerMessageKind } from "../../../src/app/enums/code-worker-message-kind";
import type { ICodeWorkerRequest } from "../../../src/app/interfaces/i-code-worker-request";
import { CodeHighlighterTokens } from "../../../src/app/models/code-highlighter-tokens";
import { CodeLanguage } from "../../../src/app/models/code-language";
import { CodeTokenizer } from "../../../src/app/models/code-tokenizer";
import { CodeWorkerGrammars } from "../../../src/app/models/code-worker-grammars";
import { CodeWorkerServer } from "../../../src/app/models/code-worker-server";
import { CodeHighlighter } from "../../../src/app/services/code-highlighter";
import { Resources } from "../../../src/resources";
import { CodeWorkerScopeFixture } from "../../fixtures/code-worker.fixture";
import { TestTimeSource } from "../../fixtures/test-time-source";

describe("CodeWorkerServer", () => {
  const signal = new AbortController().signal;
  const request = (kind: CodeWorkerMessageKind, id: number, languageId: string, code: string = String.empty): ICodeWorkerRequest =>
    ({ kind, id, languageId, code, timeLimit: Resources.codeNoTokenizeTimeLimit });
  const tokenize = (id: number, code: string, languageId: string = "json"): ICodeWorkerRequest => request(CodeWorkerMessageKind.Tokenize, id, languageId, code);
  const serve = (timeSource: TestTimeSource = new TestTimeSource()): CodeWorkerScopeFixture => {
    const scope = new CodeWorkerScopeFixture();
    new CodeWorkerServer(scope, timeSource, CodeWorkerScopeFixture.tokenizer);
    return scope;
  };

  afterEach(() => vi.restoreAllMocks());

  it("holds, by its id, the very grammars the page loads for every language the kit knows, and no other", async () => {
    const loaded: unknown[] = [];
    for (const language of CodeLanguage.all) {
      const input = typeof language.load === "function" ? await language.load() : language.load;
      loaded.push("default" in input ? input.default : input);
    }

    expect([...CodeWorkerGrammars.byId.keys()]).toEqual(CodeLanguage.all.map(t => t.id));
    expect([...CodeWorkerGrammars.byId.values()].every((t, i) => t === loaded[i])).toBe(true);
  });

  it("says it is ready before any request, then answers a load once its grammar has loaded", async () => {
    const scope = serve();
    const ready = [...scope.answers];

    scope.send(request(CodeWorkerMessageKind.Load, 4, "json"));

    expect([ready, await scope.answeredAsync(2)]).toEqual([
      [{ kind: CodeWorkerMessageKind.Ready, id: -1, tokens: [], error: null }],
      [ready[0], { kind: CodeWorkerMessageKind.Loaded, id: 4, tokens: [], error: null }]
    ]);
  });

  it("gives the tokens the page's highlighter gives, as each token's start, length and kind, across lines", async () => {
    TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 }] });
    const highlighter = TestBed.inject(CodeHighlighter);
    const jsonc = CodeLanguage.named("jsonc");
    const scope = serve();
    const sample = "{\n  // a note\n  \"a\": [1, true, null],\n  \"b\": \"c\"\n}\n";

    scope.send(tokenize(1, sample, "jsonc"));
    const tokens = Object.isNull(jsonc) ? [] : await highlighter.tokensAsync(sample, jsonc, signal);
    const answers = await scope.answeredAsync(2);

    expect(answers[1]?.tokens).toEqual(tokens.map(t => [t.start, t.text.length, t.kind]));
    expect(new Set(tokens.map(t => t.kind)).size).toBeGreaterThan(3);
  });

  it("tokenizes with the time limit each request names", async () => {
    const tokenizing = vi.spyOn(CodeTokenizer.prototype, "tokenize");
    const scope = serve();

    scope.send({ ...tokenize(1, "[1]"), timeLimit: 250 });
    await scope.answeredAsync(2);

    expect(tokenizing.mock.calls).toEqual([["[1]", "json", 250]]);
  });

  it("answers nothing to a request cancelled while its grammar loads, and ignores a cancel for a request it has answered", async () => {
    const scope = serve();

    scope.send(tokenize(1, "[1]"));
    scope.send(request(CodeWorkerMessageKind.Cancel, 1, "json"));
    scope.send(tokenize(2, "[2]"));
    await scope.answeredAsync(2);
    scope.send(request(CodeWorkerMessageKind.Cancel, 2, "json"));
    scope.send(tokenize(3, "[3]"));
    const answers = await scope.answeredAsync(3);

    expect(answers.map(t => [t.kind, t.id])).toEqual([[CodeWorkerMessageKind.Ready, -1], [CodeWorkerMessageKind.Tokens, 2], [CodeWorkerMessageKind.Tokens, 3]]);
  });

  it("fails a request for a language it doesn't know, naming the language", async () => {
    const scope = serve();

    scope.send(tokenize(1, "a", "cobol"));
    const answers = await scope.answeredAsync(2);

    expect([answers[1]?.kind, answers[1]?.id, answers[1]?.error?.message]).toEqual([CodeWorkerMessageKind.Failed, 1, expect.stringContaining("\"cobol\"")]);
  });

  it("fails the request whose load met a grammar's failure with its message, every other one without, while the failure is held, then loads it again", async () => {
    const source = new TestTimeSource();
    const failure = new Error("The grammar did not load.");
    const loadingAsync = vi.spyOn(CodeTokenizer.prototype, "loadAsync").mockRejectedValueOnce(failure);
    const scope = serve(source);

    scope.send(tokenize(1, "[1]"));
    scope.send(request(CodeWorkerMessageKind.Load, 2, "json"));
    await scope.answeredAsync(3);
    scope.send(tokenize(3, "[1]"));
    await scope.answeredAsync(4);
    source.advance(Resources.codeLoadFailureHold);
    scope.send(tokenize(4, "[1]"));
    const answers = await scope.answeredAsync(5);

    expect(answers.slice(1).map(t => [t.kind, t.id, t.error])).toEqual([
      [CodeWorkerMessageKind.Failed, 1, failure],
      [CodeWorkerMessageKind.Failed, 2, null],
      [CodeWorkerMessageKind.Failed, 3, null],
      [CodeWorkerMessageKind.Tokens, 4, null]
    ]);
    const tokens = CodeWorkerScopeFixture.tokenizer.tokenize("[1]", "json", Resources.codeNoTokenizeTimeLimit);
    expect([answers[1]?.error === failure, tokens.length > 0, answers[4]?.tokens, loadingAsync.mock.calls.length])
      .toEqual([true, true, tokens.map(t => [t.start, t.text.length, t.kind]), 2]);
  });

  it("fails a request whose tokenizing throws with the error itself, and a thrown value that isn't an error with an error naming it", async () => {
    const broke = new Error("The tokenizer broke.");
    vi.spyOn(CodeTokenizer.prototype, "tokenize").mockImplementationOnce(() => {
      throw broke;
    }).mockImplementationOnce(() => {
      throw "a string";
    });
    const scope = serve();

    scope.send(tokenize(1, "[1]"));
    scope.send(tokenize(2, "[2]"));
    const answers = await scope.answeredAsync(3);

    expect(answers.slice(1).map(t => [t.kind, t.id, t.error === broke, t.error?.message])).toEqual([
      [CodeWorkerMessageKind.Failed, 1, true, "The tokenizer broke."],
      [CodeWorkerMessageKind.Failed, 2, false, "a string"]
    ]);
  });

  it("fails a request whose error has a cause that won't clone with the error's name, message and stack, without the cause", async () => {
    const broke = new TypeError("The tokenizer broke.", { cause: () => undefined });
    vi.spyOn(CodeTokenizer.prototype, "tokenize").mockImplementationOnce(() => {
      throw broke;
    });
    const scope = serve();

    scope.send(tokenize(1, "[1]"));
    const [, answer] = await scope.answeredAsync(2);

    expect([answer?.kind, answer?.id, answer?.error?.name, answer?.error?.message, answer?.error?.stack, answer?.error?.cause])
      .toEqual([CodeWorkerMessageKind.Failed, 1, "TypeError", "The tokenizer broke.", broke.stack, undefined]);
  });
});
