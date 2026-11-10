/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { ClockTokens } from "../../../src/app/models/clock-tokens";
import { CodeHighlighterTokens } from "../../../src/app/models/code-highlighter-tokens";
import { CodeLanguage } from "../../../src/app/models/code-language";
import { CodeHighlighter } from "../../../src/app/services/code-highlighter";
import { CodeHighlightingFixture } from "../../../src/testing/models/code-highlighting-fixture";
import { CodeHighlighterFixture, type ICodeHighlighterStatics } from "../../fixtures/code-highlighter.fixture";
import { TestTimeSource } from "../../fixtures/test-time-source";

describe("CodeHighlighter", () => {
  const { typescript, tokenizing, preloadWitness, idleStepsAsync } = CodeHighlighterFixture;

  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 }, CodeHighlightingFixture.sharedShiki] }));

  describe("preloading", () => {
    let source: TestTimeSource;
    let highlighter: CodeHighlighter;

    beforeEach(() => {
      source = new TestTimeSource();
      TestBed.overrideProvider(ClockTokens.timeSource, { useValue: source });
    });

    afterEach(() => vi.restoreAllMocks());

    it("loads nothing before the page is idle, then the highlighter and a language a step per idle callback, so the language's first block gets its tokens at once", async () => {
      const startAsync = vi.spyOn(CodeHighlighter as unknown as ICodeHighlighterStatics, "startAsync");
      highlighter = TestBed.inject(CodeHighlighter);
      highlighter.preload(["ts"]);
      await vi.waitFor(() => expect(source.idleCount).toBe(1), { interval: 1 });
      const before = [source.idleCount, startAsync.mock.calls.length, highlighter.tokens("let a;", typescript)];

      const steps = await idleStepsAsync(highlighter, source, [typescript]);
      const tokenized = tokenizing(highlighter);

      expect([before, steps]).toEqual([[1, 0, undefined], 3]);
      expect([highlighter.tokens("let a;", typescript)?.map(t => t.text), tokenized(), source.idleCount]).toEqual([["let", "a"], 1, 0]);
    });

    it("loads each language it knows once, one after another, skipping a name it doesn't know and a language already loaded", async () => {
      const json = CodeLanguage.named("json") as CodeLanguage;
      const loadAsync = vi.spyOn(CodeHighlighter as unknown as ICodeHighlighterStatics, "loadLanguageAsync");
      highlighter = TestBed.inject(CodeHighlighter);
      highlighter.preload(["ts", "nothing-known", "json", "typescript", "TypeScript"]);

      const steps = await idleStepsAsync(highlighter, source, [typescript, json]);
      highlighter.preload(["ts", "yaml"]);
      await vi.waitFor(() => expect(source.idleCount).toBe(1), { interval: 1 });
      source.runIdles();
      await vi.waitFor(() => expect(source.idleCount).toBe(1), { interval: 1 });

      expect([steps, loadAsync.mock.calls.map(t => (t[1] as CodeLanguage).id)]).toEqual([6, [typescript.id, json.id]]);
    });

    it("preloads nothing for no names or only names it doesn't know", async () => {
      highlighter = TestBed.inject(CodeHighlighter);
      highlighter.preload([]);
      highlighter.preload(["nothing-known"]);
      const asked = source.idleCount;
      highlighter.preload(["ts"]);
      await vi.waitFor(() => expect(source.idleCount).toBeGreaterThan(0), { interval: 1 });

      expect([asked, source.idleCount]).toEqual([0, 1]);
    });

    it("loads nothing once its injector goes before the page is idle", async () => {
      const startAsync = vi.spyOn(CodeHighlighter as unknown as ICodeHighlighterStatics, "startAsync");
      TestBed.inject(CodeHighlighter).preload(["ts"]);
      await vi.waitFor(() => expect(source.idleCount).toBe(1), { interval: 1 });

      preloadWitness(source);
      await vi.waitFor(() => expect(source.idleCount).toBe(2), { interval: 1 });
      source.runIdles();
      await vi.waitFor(() => expect(source.idleCount).toBe(1), { interval: 1 });

      expect(startAsync.mock.calls.length).toBe(1);
    });
  });
});
