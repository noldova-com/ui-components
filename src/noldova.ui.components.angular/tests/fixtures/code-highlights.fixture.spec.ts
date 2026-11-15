/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { CodeTokenKind } from "../../src/app/enums/code-token-kind";
import { CodeToken } from "../../src/app/models/code-token";
import { CodeHighlights } from "../../src/app/services/code-highlights";
import { CodeHighlightsFixture } from "./code-highlights.fixture";

describe("CodeHighlightsFixture", () => {
  it("signals each time the page's highlights add a text's tokens or take them back, still adding and taking them back", () => {
    const changes = CodeHighlightsFixture.watch();
    const highlights = TestBed.inject(CodeHighlights);
    const heard: number[] = [];
    const keyword = (): number => [...CSS.highlights.get(CodeHighlights.nameOf(CodeTokenKind.Keyword)) ?? []].length;
    const before = keyword();
    changes.listen(() => heard.push(keyword() - before));

    const remove = highlights.add(document.createTextNode("let a;"), [new CodeToken(0, "let", CodeTokenKind.Keyword)]);
    remove();

    expect(heard).toEqual([1, 0]);
  });
});
