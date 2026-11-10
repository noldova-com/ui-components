/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

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
});
