/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler, PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { MockInstance } from "vitest";

import { ClockTokens } from "../../../src/app/models/clock-tokens";
import { CodeHighlighterTokens } from "../../../src/app/models/code-highlighter-tokens";
import { CodeHighlighter } from "../../../src/app/services/code-highlighter";
import { provideCodeHighlighting } from "../../../src/app/services/provide-code-highlighting";
import { CodeHighlightingFixture } from "../../../src/testing/models/code-highlighting-fixture";
import { CodeHighlighterFixture } from "../../fixtures/code-highlighter.fixture";
import { CodeWorkerStartFixture } from "../../fixtures/code-worker.fixture";
import { TestTimeSource } from "../../fixtures/test-time-source";

describe("provideCodeHighlighting", () => {
  it("gives code blocks the kit's highlighter, the one its injector holds", () => {
    TestBed.configureTestingModule({ providers: [provideCodeHighlighting()] });

    expect(TestBed.inject(CodeHighlighterTokens.highlighter)).toBe(TestBed.inject(CodeHighlighter));
  });

  it("asks its highlighter to preload the languages it is given, as they were when given, once its injector is created, and none when given none", () => {
    const preload = vi.spyOn(CodeHighlighter.prototype, "preload").mockImplementation(() => undefined);
    try {
      const languages = ["ts", "json"];
      TestBed.configureTestingModule({ providers: [provideCodeHighlighting({ preload: languages })] });
      languages.push("bash");
      const before = preload.mock.calls.length;
      TestBed.inject(CodeHighlighterTokens.highlighter);
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: [provideCodeHighlighting()] });
      TestBed.inject(CodeHighlighterTokens.highlighter);

      expect([before, preload.mock.calls]).toEqual([0, [[["ts", "json"]], [[]]]]);
    } finally {
      preload.mockRestore();
    }
  });

  describe("on the server", () => {
    let source: TestTimeSource;
    let starts: CodeWorkerStartFixture;
    let handleError: MockInstance<ErrorHandler["handleError"]>;

    beforeEach(() => {
      source = new TestTimeSource();
      starts = new CodeWorkerStartFixture();
    });

    afterEach(() => vi.restoreAllMocks());

    function serve(isWithWorker: boolean): CodeHighlighter {
      TestBed.configureTestingModule({
        providers: [provideCodeHighlighting({ preload: ["ts", "json"] }), ...isWithWorker ? [{ provide: CodeHighlighterTokens.worker, useValue: starts.start }] : [],
          { provide: PLATFORM_ID, useValue: "server" }, { provide: ClockTokens.timeSource, useValue: source }, CodeHighlightingFixture.sharedShiki]
      });
      handleError = vi.spyOn(TestBed.inject(ErrorHandler), "handleError").mockImplementation(() => undefined);
      return TestBed.inject(CodeHighlighter);
    }

    it("preloads none of the languages it is given, asking for no idle callback, while a block's own language still loads", async () => {
      const highlighter = serve(false);

      const tokens = await highlighter.tokensAsync("let a;", CodeHighlighterFixture.typescript, CodeHighlighterFixture.signal);

      expect([source.idleCount, highlighter.isLoaded("json"), tokens.length > 0, handleError.mock.calls]).toEqual([0, false, true, []]);
    });

    it("starts no highlighting worker for the languages it is given, and reports no failure", () => {
      serve(true);
      const asked = source.idleCount;
      source.runIdles();

      expect([asked, starts.started.length, handleError.mock.calls]).toEqual([0, 0, []]);
    });

    it("tokenizes a block's code on the page rather than in the highlighting worker, starting none and reporting no failure", async () => {
      const highlighter = serve(true);

      const tokens = await highlighter.tokensAsync("let a;", CodeHighlighterFixture.typescript, CodeHighlighterFixture.signal);

      expect([tokens.map(t => t.text), starts.started.length, handleError.mock.calls]).toEqual([["let", "a"], 0, []]);
    });
  });
});
