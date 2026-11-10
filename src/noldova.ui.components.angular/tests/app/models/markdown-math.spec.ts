/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";
import type { MarkdownIt } from "markdown-it";

import { MarkdownNodeKind } from "../../../src/app/enums/markdown-node-kind";
import type { MarkdownNode } from "../../../src/app/models/markdown.node";
import { MarkdownTree } from "../../../src/app/models/markdown-tree";
import { MarkdownParser } from "../../../src/app/services/markdown.parser";

describe("MarkdownMath", () => {
  const { Paragraph, Text, Math: InlineMath, MathDisplay, InlineCode, Code, Quote, BulletList, ListItem, SoftBreak } = MarkdownNodeKind;
  const shapeOf = (node: MarkdownNode): unknown[] =>
    [node.kind, ...[node.text, node.value].filter(t => t !== String.empty && t !== 0), ...node.children.map(shapeOf)];
  const treeAsync = async (source: string): Promise<readonly MarkdownNode[]> =>
    MarkdownTree.of((await TestBed.inject(MarkdownParser).parserAsync() as MarkdownIt).parse(source, {}));
  const shapesAsync = async (source: string): Promise<unknown[]> => (await treeAsync(source)).map(shapeOf);
  const plainAsync = async (source: string): Promise<unknown[]> => {
    const [paragraph] = await treeAsync(source) as [MarkdownNode];
    return [paragraph.kind, [...new Set(paragraph.children.map(t => t.kind))], paragraph.children.map(t => t.text).join(String.empty)];
  };

  it("reads each inline delimiter as a formula that keeps its source and its delimiter's length", async () => {
    expect(await shapesAsync("a \\(x^2\\) b $y$ c \\[z\\] d $$w$$ e")).toEqual([[Paragraph, [Text, "a "], [InlineMath, "\\(x^2\\)", 2], [Text, " b "],
      [InlineMath, "$y$", 1], [Text, " c "], [MathDisplay, "\\[z\\]", 2], [Text, " d "], [MathDisplay, "$$w$$", 2], [Text, " e"]]]);
  });

  it("keeps a provider's formulas whole, brackets and parentheses inside them included", async () => {
    expect(await shapesAsync("\\[ A_c = \\frac{\\pi r^2}{4} \\]\n\npoints \\((x,y)\\) in \\([0,1]\\)")).toEqual([
      [MathDisplay, "\\[ A_c = \\frac{\\pi r^2}{4} \\]", 2],
      [Paragraph, [Text, "points "], [InlineMath, "\\((x,y)\\)", 2], [Text, " in "], [InlineMath, "\\([0,1]\\)", 2]]
    ]);
  });

  it("reads a dollar as math only when it opens before and closes after a character that isn't a space, never before a digit, and never inside code", async () => {
    const plain = await Promise.all(["$5 and $10", "a $ b $ c", "a $b $ c", "$x$5", "\\$x\\$"].map(plainAsync));

    expect([plain, await shapesAsync("`$x$` and $x$, $y$.")]).toEqual([
      [[Paragraph, [Text], "$5 and $10"], [Paragraph, [Text], "a $ b $ c"], [Paragraph, [Text], "a $b $ c"], [Paragraph, [Text], "$x$5"], [Paragraph, [Text], "$x$"]],
      [[Paragraph, [InlineCode, "$x$"], [Text, " and "], [InlineMath, "$x$", 1], [Text, ", "], [InlineMath, "$y$", 1], [Text, "."]]]
    ]);
  });

  it("leaves a formula that never closes, or closes on nothing, as text", async () => {
    expect(await Promise.all(["$x", "$$x", "\\(x", "\\[x", "$$$$", "\\( \\)", "$$x$"].map(plainAsync))).toEqual([
      [Paragraph, [Text], "$x"], [Paragraph, [Text], "$$x"], [Paragraph, [Text], "(x"], [Paragraph, [Text], "[x"], [Paragraph, [Text], "$$$$"], [Paragraph, [Text], "( )"],
      [Paragraph, [Text], "$$x$"]
    ]);
  });

  it("never reads a formula past a paragraph's end or a list item's indent, and reads one over a link's brackets, as a code span is read", async () => {
    const sources = ["cost $", "- $$\n  c\nd"];
    const kindsOf = (nodes: readonly MarkdownNode[]): MarkdownNodeKind[] => nodes.flatMap(t => [t.kind, ...kindsOf(t.children)]);

    expect([(await Promise.all(sources.map(treeAsync))).map(t => kindsOf(t).some(kind => kind === InlineMath || kind === MathDisplay)),
      await shapesAsync("[a \\(x](https://example.com/) y\\)")])
      .toEqual([[false, false], [[Paragraph, [Text, "[a "], [InlineMath, "\\(x](https://example.com/) y\\)", 2]]]]);
  });

  it("reads display math on lines of its own as a block, in a quote and a list too, and never in code", async () => {
    const source = ["Intro", "$$", "x^2", "$$", "", "\\[ a \\]", "", "> $$", "> b", "> $$", "", "- $$", "  c", "  $$", "", "```", "$$d$$", "```", "", "    $$e$$"].join("\n");

    expect(await shapesAsync(source)).toEqual([
      [Paragraph, [Text, "Intro"]],
      [MathDisplay, "$$\nx^2\n$$", 2],
      [MathDisplay, "\\[ a \\]", 2],
      [Quote, [MathDisplay, "$$\nb\n$$", 2]],
      [BulletList, [ListItem, [MathDisplay, "$$\nc\n$$", 2]]],
      [Code, "$$d$$"],
      [Code, "$$e$$"]
    ]);
  });

  it("leaves display math to the paragraph when a blank line comes before its close, or its close doesn't end its line", async () => {
    expect([await shapesAsync("$$\nx\n\ny\n$$"), await shapesAsync("$$x$$ and more")]).toEqual([
      [[Paragraph, [Text, "$$"], [SoftBreak, "\n"], [Text, "x"]], [Paragraph, [Text, "y"], [SoftBreak, "\n"], [Text, "$$"]]],
      [[Paragraph, [MathDisplay, "$$x$$", 2], [Text, " and more"]]]
    ]);
  });
});
