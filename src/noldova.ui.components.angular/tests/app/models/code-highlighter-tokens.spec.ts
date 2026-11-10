/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeHighlighterTokens } from "../../../src/app/models/code-highlighter-tokens";

describe("CodeHighlighterTokens", () => {
  it("gives the tokenizer 500 ms for a line unless another limit is provided", () => {
    expect(TestBed.inject(CodeHighlighterTokens.tokenizeTimeLimit)).toBe(500);
  });

  it("keeps the tokens of 1,000,000 characters of code unless another length is provided", () => {
    expect(TestBed.inject(CodeHighlighterTokens.tokensKeptLength)).toBe(1_000_000);
  });

  it("gives code blocks no highlighter unless code highlighting is provided", () => {
    expect(TestBed.inject(CodeHighlighterTokens.highlighter)).toBeNull();
  });

  it("shares no Shiki between highlighters unless one is provided, so each loads its own", () => {
    expect(TestBed.inject(CodeHighlighterTokens.shiki)).toBeNull();
  });
});
