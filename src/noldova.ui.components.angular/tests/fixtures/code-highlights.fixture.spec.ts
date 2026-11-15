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
  it("signals once each call that adds a text's tokens or takes them back has returned, still adding and taking them back", async () => {
    const changes = CodeHighlightsFixture.watch();
    const highlights = TestBed.inject(CodeHighlights);
    const heard: number[] = [];
    const keyword = (): number => [...CSS.highlights.get(CodeHighlights.nameOf(CodeTokenKind.Keyword)) ?? []].length;
    const before = keyword();
    changes.listen(() => heard.push(keyword() - before));

    const remove = highlights.add(document.createTextNode("let a;"), [new CodeToken(0, "let", CodeTokenKind.Keyword)]);
    const heardInCall = [...heard];
    await Promise.resolve();
    remove();
    heardInCall.push(...heard.slice(1));
    await Promise.resolve();

    expect([heardInCall, heard]).toEqual([[], [1, 0]]);
  });
});
