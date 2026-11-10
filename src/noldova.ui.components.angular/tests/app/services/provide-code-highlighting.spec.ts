/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeHighlighterTokens } from "../../../src/app/models/code-highlighter-tokens";
import { CodeHighlighter } from "../../../src/app/services/code-highlighter";
import { provideCodeHighlighting } from "../../../src/app/services/provide-code-highlighting";

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
});
