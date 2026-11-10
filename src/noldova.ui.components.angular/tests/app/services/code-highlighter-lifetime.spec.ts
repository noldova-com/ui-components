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
import { CodeHighlighter } from "../../../src/app/services/code-highlighter";
import { Resources } from "../../../src/resources";
import { CodeHighlightingFixture } from "../../../src/testing/models/code-highlighting-fixture";
import { CodeHighlighterFixture } from "../../fixtures/code-highlighter.fixture";
import { TestTimeSource } from "../../fixtures/test-time-source";

describe("CodeHighlighter", () => {
  const { signal, typescript, ownShiki } = CodeHighlighterFixture;

  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 }, CodeHighlightingFixture.sharedShiki] }));

  it("releases its highlighter with its injector, so highlighters made one after another never pile up", async () => {
    const ini = CodeLanguage.named("ini") as CodeLanguage;
    const warn = vi.spyOn(console, "warn");

    for (let index = 0; index < 12; index++) {
      ownShiki();
      await TestBed.inject(CodeHighlighter).tokensAsync("a = 1", ini, signal);
      TestBed.resetTestingModule();
    }

    expect(warn.mock.calls.filter(t => String(t[0]).includes("[Shiki]"))).toEqual([]);
  });

  it("leaves a shared Shiki undisposed when its injector goes, so the next highlighter colors code with the grammars already in it", async () => {
    const shared = TestBed.inject(CodeHighlighterTokens.shiki);
    if (Object.isNull(shared))
      throw new Error("The spec file's testing module provides a shared Shiki.");
    const dispose = vi.spyOn(shared, "dispose");
    await TestBed.inject(CodeHighlighter).tokensAsync("let a;", typescript, signal);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [CodeHighlightingFixture.sharedShiki] });
    const tokens = await TestBed.inject(CodeHighlighter).tokensAsync("let b;", typescript, signal);
    const disposals = dispose.mock.calls.length;
    dispose.mockRestore();

    expect([disposals, tokens.map(t => t.text)]).toEqual([0, ["let", "b"]]);
  });

  it("gives nothing to a call still in flight when its injector goes, and never reaches the released highlighter", async () => {
    ownShiki();
    const tokens = TestBed.inject(CodeHighlighter).tokensAsync("let a;", typescript, signal);

    TestBed.resetTestingModule();

    await expect(tokens).resolves.toEqual([]);
  });

  it("reports nothing when its injector goes while a grammar loads, so the released highlighter's refusal never reaches the error handler", async () => {
    const errors: unknown[] = [];
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (error: unknown) => errors.push(error) } });
    ownShiki();
    const releases: (() => void)[] = [];
    const slow: CodeLanguage = { id: typescript.id, aliases: [], load: () => new Promise(resolve => releases.push(() => resolve(import("@shikijs/langs/typescript")))) };
    const tokens = TestBed.inject(CodeHighlighter).tokensAsync("let a;", slow, signal);
    await vi.waitFor(() => expect(releases.length).toBe(1), { interval: 1 });

    TestBed.resetTestingModule();
    releases[0]?.();

    await expect(tokens).resolves.toEqual([]);
    expect(errors).toEqual([]);
  });

  it("reports a grammar that failed to load once, leaves code plain while the failure is held, then loads the grammar again", async () => {
    const errors: unknown[] = [];
    const failure = new Error("The grammar's chunk did not load.");
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (error: unknown) => errors.push(error) } });
    const source = new TestTimeSource();
    TestBed.overrideProvider(ClockTokens.timeSource, { useValue: source });
    let loads = 0;
    const flaky: CodeLanguage = { id: typescript.id, aliases: [], load: () => loads++ === 0 ? Promise.reject(failure) : import("@shikijs/langs/typescript") };
    const highlighter = TestBed.inject(CodeHighlighter);
    await highlighter.tokensAsync("echo hi", CodeLanguage.named("sh") as CodeLanguage, signal);

    const held: unknown[] = [];
    for (const code of ["let", "let a", "let a;"])
      held.push(await highlighter.tokensAsync(code, flaky, signal));
    source.advance(Resources.codeLoadFailureHold);
    const loaded = await highlighter.tokensAsync("let a;", flaky, signal);

    expect([held, errors, loads]).toEqual([[[], [], []], [failure], 2]);
    expect(loaded.map(t => t.text)).toEqual(["let", "a"]);
  });

  it("reports a grammar that loads but fails its first tokenizing like one that failed to load, and leaves code plain", async () => {
    const errors: unknown[] = [];
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (error: unknown) => errors.push(error) } });
    const misnamed: CodeLanguage = { id: "misnamed", aliases: [], load: () => import("@shikijs/langs/typescript") };

    const tokens = await TestBed.inject(CodeHighlighter).tokensAsync("let a;", misnamed, signal);

    expect([tokens, errors.length, String(errors[0])]).toEqual([[], 1, expect.stringContaining("misnamed")]);
  });
});
