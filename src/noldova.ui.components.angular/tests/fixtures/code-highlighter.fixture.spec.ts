/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { CodeHighlighterTokens } from "../../src/app/models/code-highlighter-tokens";
import { CodeLanguage } from "../../src/app/models/code-language";
import { CodeHighlighter } from "../../src/app/services/code-highlighter";
import { CodeHighlightingFixture } from "../../src/testing/models/code-highlighting-fixture";
import { CodeHighlighterFixture } from "./code-highlighter.fixture";

describe("CodeHighlighterFixture", () => {
  const { ownShiki, sampleResultsAsync } = CodeHighlighterFixture;

  beforeEach(() => TestBed.configureTestingModule({ providers: [{ provide: CodeHighlighterTokens.tokenizeTimeLimit, useValue: 0 }, CodeHighlightingFixture.sharedShiki] }));

  it("gives true for a sample that has tokens, each at its place", async () => {
    expect(await sampleResultsAsync(TestBed.inject(CodeHighlighter), ["json"])).toEqual([["json", true, true]]);
  });

  it("says the highlighter was disposed when its injector went while the sample waited", async () => {
    const results = sampleResultsAsync(TestBed.inject(CodeHighlighter), ["json"]);

    TestBed.resetTestingModule();

    expect(await results).toEqual([["json", true, "no tokens: the highlighter was disposed"]]);
  });

  it("says the grammar's load failed, with what the highlighter reported", async () => {
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (): void => undefined } });
    const failing: CodeLanguage = { id: "json", aliases: [], load: () => Promise.reject(new Error("The grammar's chunk did not load.")) };
    const named = vi.spyOn(CodeLanguage, "named").mockReturnValue(failing);

    const results = await sampleResultsAsync(TestBed.inject(CodeHighlighter), ["json"]);
    named.mockRestore();

    expect(results).toEqual([["json", true, "no tokens: the grammar's load failed, reporting The grammar's chunk did not load."]]);
  });

  it("lists each token's color and scopes when a loaded grammar's tokens all read as plain", async () => {
    const highlighter = TestBed.inject(CodeHighlighter);
    await sampleResultsAsync(highlighter, ["json"]);
    vi.spyOn(highlighter, "tokensAsync").mockResolvedValue([]);

    const results = await sampleResultsAsync(highlighter, ["json"]);

    expect(results).toEqual([["json", true, expect.stringMatching(/^no tokens: the grammar's tokens all read as plain: "\{ ?" \S+ source\.json .*punctuation\.definition\.dictionary\.begin\.json/u)]]);
  });

  it("says the scopes are read only with a shared Shiki when the highlighter has its own", async () => {
    ownShiki();
    const highlighter = TestBed.inject(CodeHighlighter);
    vi.spyOn(highlighter, "tokensAsync").mockResolvedValue([]);

    expect(await sampleResultsAsync(highlighter, ["json"])).toEqual([["json", true, "no tokens: the grammar loaded, so its tokens all read as plain; its scopes are read only with a shared Shiki"]]);
  });

  it("says why the scopes couldn't be read for a language the highlighter doesn't know", async () => {
    const results = await sampleResultsAsync(TestBed.inject(CodeHighlighter), ["no-such-language"]);

    expect(results).toEqual([["no-such-language", true, expect.stringMatching(/^no tokens, and the grammar's scopes couldn't be read: .*no-such-language/u)]]);
  });
});
