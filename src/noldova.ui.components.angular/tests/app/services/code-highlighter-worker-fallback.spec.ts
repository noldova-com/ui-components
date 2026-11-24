/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CodeTokenKind } from "../../../src/app/enums/code-token-kind";
import { CodeWorkerMessageKind } from "../../../src/app/enums/code-worker-message-kind";
import type { ICodeWorkerAnswer } from "../../../src/app/interfaces/i-code-worker-answer";
import { Resources } from "../../../src/resources";
import { CodeHighlighterWorkerFixture } from "../../fixtures/code-highlighter-worker.fixture";
import { type CodeWorkerFixture, CodeWorkerStartFixture } from "../../fixtures/code-worker.fixture";

describe("CodeHighlighter with a highlighting worker", () => {
  const { signal, json, off, offFailure } = CodeHighlighterWorkerFixture;
  let bed: CodeHighlighterWorkerFixture;

  beforeEach(() => {
    bed = new CodeHighlighterWorkerFixture();
  });

  afterEach(() => vi.restoreAllMocks());

  describe("gives the worker up for good, reports why once and tokenizes on the page instead", () => {
    const cases: readonly {
      readonly name: string;
      readonly isServing: boolean;
      readonly isReady: boolean;
      readonly fail: (worker: CodeWorkerFixture | undefined) => unknown;
      readonly reason: string;
      readonly afterFailing: unknown;
    }[] = [
      { name: "a worker whose script fails to load", isServing: false, isReady: false, fail: t => t?.fail(String.empty), reason: Resources.codeWorkerLoadFailure, afterFailing: false },
      { name: "a worker that says nothing within 10 seconds of its start", isServing: false, isReady: false, fail: () => bed.source.advance(Resources.codeWorkerStartLimit), reason: Resources.codeWorkerSilent, afterFailing: undefined },
      { name: "a worker that fails after it said it is ready", isServing: true, isReady: true, fail: t => t?.fail("The worker broke."), reason: "The worker broke.", afterFailing: false },
      { name: "a worker one of whose answers the page can't read", isServing: true, isReady: true, fail: t => t?.failToRead(), reason: Resources.codeWorkerUnreadAnswer, afterFailing: undefined }
    ];

    for (const { name, isServing, isReady, fail, reason, afterFailing } of cases)
      it(`for ${name}, giving the request it was answering the page's tokens`, async () => {
        const starts = new CodeWorkerStartFixture(isServing);
        const highlighter = bed.serve(starts.start);
        if (isReady)
          await highlighter.tokensAsync("1", json, signal);

        const tokens = highlighter.tokensAsync("{ \"a\": 1 }", json, signal);
        const failing = fail(starts.started[0]);
        const page = await tokens;
        const later = await highlighter.tokensAsync("2", json, signal);

        expect([page.length > 0, later.length > 0, failing, bed.loadedOnPage(highlighter)]).toEqual([true, true, afterFailing, true]);
        expect([bed.messages(), starts.started.map(t => [t.isTerminated, t.requests.length])]).toEqual([[[Resources.formatCodeWorkerFailure(reason), undefined]], [[true, isReady ? 2 : 1]]]);
      });

    it("for a worker that can't start, never trying it again", async () => {
      let tries = 0;
      const highlighter = bed.serve(() => {
        tries++;
        throw off;
      });

      const tokens = [await highlighter.tokensAsync("1", json, signal), await highlighter.tokensAsync("2", json, signal)];

      expect([tokens.every(t => t.length > 0), tries, bed.loadedOnPage(highlighter)]).toEqual([true, 1, true]);
      expect(bed.messages()).toEqual([offFailure]);
    });
  });

  describe("ends a worker that says nothing for 10 seconds after it is ready while a request waits", () => {
    const ready: ICodeWorkerAnswer = { kind: CodeWorkerMessageKind.Ready, id: -1, tokens: [], error: null };
    const hung: readonly unknown[] = [Resources.formatCodeWorkerFailure(Resources.codeWorkerHung), undefined];

    it("giving it up for good and reporting it once, showing the code it waited on plain rather than tokenizing it on the page, and later code on the page", async () => {
      const starts = new CodeWorkerStartFixture(false);
      const highlighter = bed.serve(starts.start);
      const tokens = highlighter.tokensAsync("{ \"a\": 1 }", json, signal);
      starts.started[0]?.answer(ready);
      bed.source.advance(Resources.codeWorkerAnswerLimit - 1);
      const before = starts.started[0]?.isTerminated;
      bed.source.advance(1);
      const plain = await tokens;
      const onPage = bed.loadedOnPage(highlighter);
      const later = await highlighter.tokensAsync("2", json, signal);

      expect([before, starts.started[0]?.isTerminated, plain, onPage, later.length > 0, starts.started.length, bed.loadedOnPage(highlighter)])
        .toEqual([false, true, [], false, true, 1, true]);
      expect(bed.messages()).toEqual([hung]);
    });

    it("counting the 10 seconds from its last answer, not from the request", async () => {
      const starts = new CodeWorkerStartFixture(false);
      const highlighter = bed.serve(starts.start);
      const first = highlighter.tokensAsync("1", json, signal);
      const second = highlighter.tokensAsync("2", json, signal);
      starts.started[0]?.answer(ready);
      bed.source.advance(Resources.codeWorkerAnswerLimit - 1);
      starts.started[0]?.answer({ kind: CodeWorkerMessageKind.Tokens, id: 0, tokens: [[0, 1, CodeTokenKind.Number]], error: null });
      const answered = await first;
      bed.source.advance(Resources.codeWorkerAnswerLimit - 1);
      const before = starts.started[0]?.isTerminated;
      bed.source.advance(1);

      expect([answered.map(t => t.text), before, starts.started[0]?.isTerminated, await second]).toEqual([["1"], false, true, []]);
      expect(bed.messages()).toEqual([hung]);
    });

    it("leaving a ready worker with nothing to answer alone", () => {
      const starts = new CodeWorkerStartFixture(false);
      const highlighter = bed.serve(starts.start);
      void highlighter.tokensAsync("1", json, signal);
      starts.started[0]?.answer(ready);
      starts.started[0]?.answer({ kind: CodeWorkerMessageKind.Tokens, id: 0, tokens: [], error: null });
      bed.source.advance(Resources.codeWorkerAnswerLimit * 2);

      expect([starts.started[0]?.isTerminated, bed.messages()]).toEqual([false, []]);
    });
  });
});
