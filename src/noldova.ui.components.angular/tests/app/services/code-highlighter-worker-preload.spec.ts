/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeWorkerMessageKind } from "../../../src/app/enums/code-worker-message-kind";
import { ClockTokens } from "../../../src/app/models/clock-tokens";
import { CodeTokenizer } from "../../../src/app/models/code-tokenizer";
import { CodeHighlighterWorkerFixture } from "../../fixtures/code-highlighter-worker.fixture";
import { CodeWorkerStartFixture } from "../../fixtures/code-worker.fixture";

describe("CodeHighlighter with a highlighting worker", () => {
  const { signal, json, ini, off, offFailure, sent } = CodeHighlighterWorkerFixture;
  let bed: CodeHighlighterWorkerFixture;

  beforeEach(() => {
    bed = new CodeHighlighterWorkerFixture();
  });

  afterEach(() => vi.restoreAllMocks());

  describe("preloading", () => {
    it("asks the worker to load each language after the page's first idle callback, loading nothing on the page, so a block's first tokens need no grammar load", async () => {
      const starts = new CodeWorkerStartFixture();
      const highlighter = bed.serve(starts.start);

      highlighter.preload(["json", "ini", "cobol"]);
      const before = [bed.source.idleCount, starts.started.length];
      bed.source.runIdles();
      await vi.waitFor(() => expect(starts.started[0]?.scope.answers.length).toBe(3), { interval: 1 });
      const tokens = await highlighter.tokensAsync("1", json, signal);

      expect([before, sent(starts.started[0]), bed.source.idleCount, bed.loadedOnPage(highlighter), bed.loadedOnPage(highlighter, ini), tokens.length > 0]).toEqual([
        [1, 0], [[CodeWorkerMessageKind.Load, json.id, String.empty], [CodeWorkerMessageKind.Load, ini.id, String.empty], [CodeWorkerMessageKind.Tokenize, json.id, "1"]], 0, false, false, true
      ]);
    });

    it("reports a language the worker failed to load and loads nothing on the page", async () => {
      const failure = new Error("The grammar did not load.");
      vi.spyOn(CodeTokenizer.prototype, "loadAsync").mockRejectedValueOnce(failure);
      const starts = new CodeWorkerStartFixture();
      const highlighter = bed.serve(starts.start);

      highlighter.preload(["json"]);
      bed.source.runIdles();
      await vi.waitFor(() => expect(bed.errors.length).toBe(1), { interval: 1 });

      expect([bed.messages(), bed.source.idleCount, bed.loadedOnPage(highlighter)]).toEqual([[[failure.message, failure]], 0, false]);
    });

    it("loads the languages on the page a step per idle callback once the worker is given up", async () => {
      const highlighter = bed.serve(() => {
        throw off;
      });

      highlighter.preload(["json", "ini"]);
      bed.source.runIdles();
      let steps = 0;
      while (!bed.loadedOnPage(highlighter)) {
        await vi.waitFor(() => expect(bed.source.idleCount === 1 || bed.loadedOnPage(highlighter)).toBe(true), { interval: 1 });
        if (bed.source.idleCount === 1) {
          bed.source.runIdles();
          steps++;
        }
      }

      expect([steps > 0, bed.messages()]).toEqual([true, [offFailure]]);
    });

    it("loads the languages on the page when the worker was given up before the page was idle, reporting its failure once", async () => {
      const highlighter = bed.serve(() => {
        throw off;
      });
      await highlighter.tokensAsync("1", json, signal);

      highlighter.preload(["ini"]);
      while (!bed.loadedOnPage(highlighter, ini)) {
        await vi.waitFor(() => expect(bed.source.idleCount === 1 || bed.loadedOnPage(highlighter, ini)).toBe(true), { interval: 1 });
        bed.source.runIdles();
      }

      expect(bed.messages()).toEqual([offFailure]);
    });

    it("asks nothing of the worker once its injector goes before the page is idle", async () => {
      const starts = new CodeWorkerStartFixture();
      bed.serve(starts.start).preload(["json"]);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: bed.source }] });
      const live = new CodeWorkerStartFixture();
      bed.serve(live.start).preload(["json"]);

      bed.source.runIdles();
      await vi.waitFor(() => expect(live.started.length).toBe(1), { interval: 1 });

      expect([starts.started.length, bed.errors]).toEqual([0, []]);
    });
  });
});
