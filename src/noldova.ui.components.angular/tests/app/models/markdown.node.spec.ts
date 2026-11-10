/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownNodeKind } from "../../../src/app/enums/markdown-node-kind";
import { MarkdownNode } from "../../../src/app/models/markdown.node";

describe("MarkdownNode", () => {
  const fieldsOf = (node: MarkdownNode): unknown[] => [node.kind, node.children, node.text, node.value, node.href, node.language, node.align];
  const textNode = (value: string): MarkdownNode => MarkdownNode.textOf(MarkdownNodeKind.Text, value);
  const strongNode = (value: string): MarkdownNode => MarkdownNode.of(MarkdownNodeKind.Strong, [textNode(value)]);

  it("reuses the nodes that come out the same as the ones before, also inside a node that changed, and the whole list when nothing changed", () => {
    const before = [MarkdownNode.of(MarkdownNodeKind.Paragraph, [textNode("a"), strongNode("b")]), MarkdownNode.code("x", "ts")];
    const after = [MarkdownNode.of(MarkdownNodeKind.Paragraph, [textNode("a"), strongNode("b"), textNode("c")]), MarkdownNode.code("x", "js"), MarkdownNode.code("y", null)];
    const [paragraph, code, added] = MarkdownNode.reuseAll(after, before);
    const unchanged = [MarkdownNode.of(MarkdownNodeKind.Paragraph, [textNode("a"), strongNode("b")]), MarkdownNode.code("x", "ts")];

    expect([paragraph === before[0], paragraph?.children[0] === before[0]?.children[0], paragraph?.children[1] === before[0]?.children[1],
      paragraph?.children[2] === after[0]?.children[2], fieldsOf(paragraph as MarkdownNode).slice(2), code === after[1], added === after[2],
      MarkdownNode.reuseAll(unchanged, before) === before, MarkdownNode.reuseAll(unchanged.slice(0, 1), before)[0] === before[0]])
      .toEqual([false, true, true, true, ["", 0, "", null, null], true, true, true, true]);
  });

  it("keeps what each kind of node carries, and gives the rest empty values", () => {
    const text = MarkdownNode.textOf(MarkdownNodeKind.Text, "a");

    expect([
      MarkdownNode.of(MarkdownNodeKind.Paragraph, [text]),
      MarkdownNode.textOf(MarkdownNodeKind.Text, "a"),
      MarkdownNode.numbered(MarkdownNodeKind.Heading, 2, [text]),
      MarkdownNode.code("let a;", "ts"),
      MarkdownNode.link("https://example.com/", [text]),
      MarkdownNode.cell(MarkdownNodeKind.TableCell, "center", [text])
    ].map(fieldsOf)).toEqual([
      [MarkdownNodeKind.Paragraph, [text], "", 0, "", null, null],
      [MarkdownNodeKind.Text, [], "a", 0, "", null, null],
      [MarkdownNodeKind.Heading, [text], "", 2, "", null, null],
      [MarkdownNodeKind.Code, [], "let a;", 0, "", "ts", null],
      [MarkdownNodeKind.Link, [text], "", 0, "https://example.com/", null, null],
      [MarkdownNodeKind.TableCell, [text], "", 0, "", null, "center"]
    ]);
  });
});
