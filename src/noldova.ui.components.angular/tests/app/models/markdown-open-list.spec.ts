/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";
import type { MarkdownIt } from "markdown-it";

import { MarkdownOpenList } from "../../../src/app/models/markdown-open-list";
import { MarkdownParser } from "../../../src/app/services/markdown.parser";

describe("MarkdownOpenList", () => {
  let parser: MarkdownIt;

  beforeEach(async () => {
    parser = await TestBed.inject(MarkdownParser).parserAsync() as MarkdownIt;
  });

  it("opens a list only once it has more items than it keeps open", () => {
    expect([
      MarkdownOpenList.isOpenable(parser.parse("- a\n- b\n- c", {})),
      MarkdownOpenList.isOpenable(parser.parse("1. a\n2. b\n3. c", {})),
      MarkdownOpenList.isOpenable(parser.parse("- a\n- b", {})),
      MarkdownOpenList.isOpenable(parser.parse("Text", {})),
      MarkdownOpenList.isOpenable(undefined)
    ]).toEqual([true, true, false, false, false]);
  });

  it("splits a list into its own items, each with what it holds", () => {
    const items = MarkdownOpenList.itemsOf(parser.parse("- a\n  - a1\n  - a2\n- b", {}));

    expect(items.map(t => [t[0]?.type, t.at(-1)?.type, t.filter(u => u.type === "list_item_open").length])).toEqual([
      ["list_item_open", "list_item_close", 3], ["list_item_open", "list_item_close", 1]
    ]);
  });
});
