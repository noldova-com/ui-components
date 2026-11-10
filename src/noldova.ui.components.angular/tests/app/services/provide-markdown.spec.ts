/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { MarkdownViewTokens } from "../../../src/app/models/markdown-view-tokens";
import { MarkdownParser } from "../../../src/app/services/markdown.parser";
import { provideMarkdown } from "../../../src/app/services/provide-markdown";

describe("provideMarkdown", () => {
  it("gives Markdown views the kit's parser, the one its injector holds", () => {
    TestBed.configureTestingModule({ providers: [provideMarkdown()] });

    expect(TestBed.inject(MarkdownViewTokens.parser)).toBe(TestBed.inject(MarkdownParser));
  });
});
