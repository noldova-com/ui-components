/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { MarkdownViewTokens } from "../../../src/app/models/markdown-view-tokens";

describe("MarkdownViewTokens", () => {
  it("leaves Markdown code blocks uncapped unless a height is provided", () => {
    expect(TestBed.inject(MarkdownViewTokens.codeHeight)).toBeNull();
  });

  it("gives Markdown views no parser unless Markdown is provided", () => {
    expect(TestBed.inject(MarkdownViewTokens.parser)).toBeNull();
  });
});
