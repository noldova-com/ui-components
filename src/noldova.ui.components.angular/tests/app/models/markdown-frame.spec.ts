/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import MarkdownIt, { type Token } from "markdown-it";

import { MarkdownNodeKind } from "../../../src/app/enums/markdown-node-kind";
import { MarkdownFrame } from "../../../src/app/models/markdown-frame";
import { MarkdownNode } from "../../../src/app/models/markdown.node";

describe("MarkdownFrame", () => {
  it("makes a node of each container it closes, and lifts the text of a hidden paragraph into its list item", () => {
    const [listOpen, itemOpen, paragraphOpen] = new MarkdownIt().parse("- a", {}) as [Token, Token, Token];
    const root = MarkdownFrame.root();
    const list = root.childOf(listOpen);
    const item = list.childOf(itemOpen);
    const paragraph = item.childOf(paragraphOpen);
    paragraph.children.push(MarkdownNode.textOf(MarkdownNodeKind.Text, "a"));

    item.take(paragraph);
    list.take(item);
    root.take(list);

    expect(root.children.map(t => [t.kind, t.children.map(i => [i.kind, i.children.map(c => [c.kind, c.text])])])).toEqual([
      [MarkdownNodeKind.BulletList, [[MarkdownNodeKind.ListItem, [[MarkdownNodeKind.Text, "a"]]]]]
    ]);
  });
});
