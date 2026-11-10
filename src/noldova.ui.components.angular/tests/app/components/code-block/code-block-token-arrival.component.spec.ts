/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { CodeHighlighter } from "../../../../src/app/services/code-highlighter";
import { CodeTokenKind } from "../../../../src/app/enums/code-token-kind";
import { CodeHighlighterTokens } from "../../../../src/app/models/code-highlighter-tokens";
import { CodeToken } from "../../../../src/app/models/code-token";
import { CodeBlockHarness } from "../../../fixtures/code-block-harness.fixture";

describe("CodeBlockComponent", () => {
  const harness = new CodeBlockHarness();
  const { renderAsync, changeAsync, find, tokens, tokenSpans, plain, shownOf } = harness;

  beforeEach(harness.configure);

  afterEach(harness.resetAsync);

  it("leaves code in a language it knows plain, and never asks for tokens, when the app provides no code highlighting", async () => {
    TestBed.overrideProvider(CodeHighlighterTokens.highlighter, { useValue: null });
    const askedAsync = vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync");
    await renderAsync();

    expect(plain()).toEqual([0, true, harness.host.code()]);
    expect(askedAsync).not.toHaveBeenCalled();
  });

  it("never lets the tokens of older code that arrive after those of newer code land", async () => {
    const answers = new Map<string, (tokens: readonly CodeToken[]) => void>();
    vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync").mockImplementation(code => code.startsWith("let ")
      ? new Promise(resolve => answers.set(code, resolve))
      : Promise.resolve([]));
    await renderAsync();
    for (const code of ["let older;", "let newer;"]) {
      harness.host.code.set(code);
      await vi.waitFor(() => {
        harness.fixture.detectChanges();
        expect(answers.has(code)).toBe(true);
      }, { interval: 1 });
    }

    answers.get("let newer;")?.([new CodeToken(4, "newer", CodeTokenKind.Variable)]);
    await vi.waitFor(() => {
      harness.fixture.detectChanges();
      expect(tokens()).toEqual([["newer", "variable"]]);
    }, { interval: 1 });
    answers.get("let older;")?.([new CodeToken(4, "older", CodeTokenKind.Type)]);
    await harness.fixture.whenStable();

    expect(tokens()).toEqual([["newer", "variable"]]);
  });

  it("reports tokens that failed to arrive and stays plain, then colors the next code", async () => {
    const errors: unknown[] = [];
    const failure = new Error("The grammar's chunk did not load.");
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (error: unknown) => errors.push(error) } });
    const next = [new CodeToken(0, "let", CodeTokenKind.Keyword), new CodeToken(4, "next", CodeTokenKind.Variable)];
    vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync").mockRejectedValueOnce(failure).mockResolvedValueOnce(next);
    await renderAsync();
    const original = harness.host.code();
    const failed = plain();

    await changeAsync(() => harness.host.code.set("let next;"));

    expect([failed, errors]).toEqual([[0, true, original], [failure]]);
    expect(tokens()).toEqual(shownOf(next));
  });

  it("keeps a selection in its code when the code's tokens arrive and it settles into spans", async () => {
    const answers: ((tokens: readonly CodeToken[]) => void)[] = [];
    vi.spyOn(TestBed.inject(CodeHighlighter), "tokensAsync").mockImplementation(code => code === "let selected;"
      ? new Promise(resolve => answers.push(resolve))
      : Promise.resolve([]));
    await renderAsync();
    harness.host.code.set("let selected;");
    await vi.waitFor(() => {
      harness.fixture.detectChanges();
      expect(answers.length).toBe(1);
    }, { interval: 1 });
    const code = find(".nol-code-block-body > code");
    const text = code.firstChild?.firstChild ?? code;
    getSelection()?.setBaseAndExtent(text, 4, text, 12);

    answers[0]?.([new CodeToken(0, "let", CodeTokenKind.Keyword)]);
    await vi.waitFor(() => {
      harness.fixture.detectChanges();
      expect(tokens()).toEqual([["let", "keyword"]]);
    }, { interval: 1 });

    expect([getSelection()?.toString(), tokenSpans()]).toEqual(["selected", 1]);
    getSelection()?.removeAllRanges();
  });
});
