/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { ClockTokens } from "../../../src/app/models/clock-tokens";
import { CodeHighlighterTokens } from "../../../src/app/models/code-highlighter-tokens";
import { CodeLanguage } from "../../../src/app/models/code-language";
import { CodeTokenizer } from "../../../src/app/models/code-tokenizer";
import { CodeHighlighter } from "../../../src/app/services/code-highlighter";
import { Resources } from "../../../src/resources";
import { CodeHighlightingFixture } from "../../../src/testing/models/code-highlighting-fixture";
import { CodeHighlighterFixture, type ICodeHighlighterStatics } from "../../fixtures/code-highlighter.fixture";
import { TestTimeSource } from "../../fixtures/test-time-source";

describe("CodeHighlighter", () => {
  const { signal, typescript, preloadWitness, idleStepsAsync } = CodeHighlighterFixture;

  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 }, CodeHighlightingFixture.sharedShiki] }));

  describe("preloading", () => {
    let source: TestTimeSource;
    let highlighter: CodeHighlighter;

    beforeEach(() => {
      source = new TestTimeSource();
      TestBed.overrideProvider(ClockTokens.timeSource, { useValue: source });
    });

    afterEach(() => vi.restoreAllMocks());

    it("reports a language that fails to load, goes on to the next, and loads the failed one again when a block needs it once the failure is held", async () => {
      const errors: unknown[] = [];
      const failure = new Error("The grammar's chunk did not load.");
      TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (error: unknown) => errors.push(error) } });
      let loads = 0;
      const flaky: CodeLanguage = { id: typescript.id, aliases: [], load: () => loads++ === 0 ? Promise.reject(failure) : import("@shikijs/langs/typescript") };
      const json = CodeLanguage.named("json") as CodeLanguage;
      const named = CodeLanguage.named.bind(CodeLanguage);
      vi.spyOn(CodeLanguage, "named").mockImplementation(name => name === "flaky" ? flaky : named(name));
      highlighter = TestBed.inject(CodeHighlighter);
      highlighter.preload(["flaky", "json"]);

      const steps = await idleStepsAsync(highlighter, source, [json]);
      const held = highlighter.tokens("let a;", flaky);
      source.advance(Resources.codeLoadFailureHold);
      const loaded = await highlighter.tokensAsync("let a;", flaky, signal);

      expect([steps, errors, held, loads]).toEqual([5, [failure], undefined, 2]);
      expect(loaded.map(t => t.text)).toEqual(["let", "a"]);
    });

    it("loads a language once when a block needs it before its preload starts, giving the block its tokens without waiting for the page to be idle", async () => {
      const loadAsync = vi.spyOn(CodeHighlighter as unknown as ICodeHighlighterStatics, "loadLanguageAsync");
      highlighter = TestBed.inject(CodeHighlighter);
      highlighter.preload(["ts", "yaml"]);

      const tokens = await highlighter.tokensAsync("let a;", typescript, signal);
      const waiting = source.idleCount;
      source.runIdles();
      await vi.waitFor(() => expect(source.idleCount).toBe(1), { interval: 1 });

      expect([tokens.map(t => t.text), waiting, loadAsync.mock.calls.length]).toEqual([["let", "a"], 1, 1]);
    });

    for (const [ran, step] of [[1, "loading its grammar"], [2, "warming it"]] as const)
      it(`gives a block that opens while the preload waits to start ${step} its tokens without waiting for the page to be idle again`, async () => {
        const loadAsync = vi.spyOn(CodeHighlighter as unknown as ICodeHighlighterStatics, "loadLanguageAsync");
        highlighter = TestBed.inject(CodeHighlighter);
        highlighter.preload(["ts"]);
        for (let done = 0; done < ran; done++) {
          await vi.waitFor(() => expect(source.idleCount).toBe(1), { interval: 1 });
          source.runIdles();
        }
        await vi.waitFor(() => expect(source.idleCount).toBe(1), { interval: 1 });

        const tokens = await highlighter.tokensAsync("let a;", typescript, signal);

        expect([tokens.map(t => t.text), loadAsync.mock.calls.length, source.idleCount]).toEqual([["let", "a"], 1, 0]);
      });

    for (const [ran, step, done] of [[1, "load a grammar", [0, 0]], [2, "warm it", [1, 0]]] as const)
      it(`stops once its injector goes while the preload waits to ${step}`, async () => {
        const loadsAsync = vi.spyOn(CodeTokenizer.prototype, "loadAsync");
        const warmings = vi.spyOn(CodeTokenizer.prototype, "warm");
        TestBed.inject(CodeHighlighter).preload(["ts"]);
        for (let waited = 0; waited < ran; waited++) {
          await vi.waitFor(() => expect(source.idleCount).toBe(1), { interval: 1 });
          source.runIdles();
        }
        await vi.waitFor(() => expect(source.idleCount).toBe(1), { interval: 1 });

        preloadWitness(source);
        await vi.waitFor(() => expect(source.idleCount).toBe(2), { interval: 1 });
        source.runIdles();
        await vi.waitFor(() => expect(source.idleCount).toBe(1), { interval: 1 });

        expect([loadsAsync.mock.calls.length, warmings.mock.calls.length]).toEqual(done);
      });
  });
});
