/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";
import type { MarkdownIt } from "markdown-it";

import type { MarkdownNode } from "../../../src/app/models/markdown.node";
import { MarkdownOpenParagraph } from "../../../src/app/models/markdown-open-paragraph";
import { MarkdownTree } from "../../../src/app/models/markdown-tree";
import { MarkdownParser } from "../../../src/app/services/markdown.parser";

describe("MarkdownOpenParagraph", () => {
  let parser: MarkdownIt;

  beforeEach(async () => {
    parser = await TestBed.inject(MarkdownParser).parserAsync() as MarkdownIt;
  });

  const shownOf = (text: string): MarkdownNode => MarkdownTree.of(parser.parse(text, {}))[0] as MarkdownNode;
  const joinedOf = (chunk: string, tail: string): [string, string] => {
    const paragraph = new MarkdownOpenParagraph(0);
    const shown = shownOf(chunk + tail);
    paragraph.take(parser, chunk, {});
    paragraph.keep(shown);
    return [JSON.stringify(paragraph.nodeOf(parser.parse(tail, {}))), JSON.stringify(shown)];
  };

  it("goes on while the text after its cut parses as one line of the same paragraph", () => {
    expect([
      MarkdownOpenParagraph.continues(parser.parse(" text", {})),
      MarkdownOpenParagraph.continues(parser.parse(" text\n\n# Next", {})),
      MarkdownOpenParagraph.continues(parser.parse(" text\n===", {})),
      MarkdownOpenParagraph.continues(parser.parse(" text\nmore", {})),
      MarkdownOpenParagraph.continues(parser.parse(" ", {}))
    ]).toEqual([true, true, false, false, false]);
  });

  it("cuts at the last single space between a letter or digit and a letter, after its start and up to its end", () => {
    const text = "ab cd, ef 1g hi  jk lm";

    expect([
      MarkdownOpenParagraph.cutOf(text, 0, text.length),
      MarkdownOpenParagraph.cutOf(text, 0, 18),
      MarkdownOpenParagraph.cutOf(text, 12, 18),
      MarkdownOpenParagraph.cutOf(text, 0, 1)
    ]).toEqual([19, 12, -1, -1]);
  });

  it("takes text whose emphasis, links and code all close in it, also with delimiters that can't open, escapes and entities", () => {
    const paragraph = new MarkdownOpenParagraph(0);

    expect(paragraph.take(parser, "a **b** _c_ ~~d~~ `e [f` [g](https://example.com/) ![h](https://example.com/h.png) www.example.com i_j 2 * 3 k* \\[l &#91;m &#96;n", {}))
      .toBe(true);
  });

  it("refuses text with an emphasis, a strikethrough, a link or a code span still open, or a reference it doesn't know", () => {
    const paragraph = new MarkdownOpenParagraph(0);

    expect(["a **b c", "a _b c", "a ~~b c", "a [b c", "a ``b c", "a [b][r] c"].map(t => paragraph.take(parser, t, {}))).toEqual([false, false, false, false, false, false]);
  });

  it("joins the nodes it keeps to the nodes after its cut as the whole paragraph holds them, and keeps their objects", () => {
    const paragraph = new MarkdownOpenParagraph(0);
    const shown = shownOf("Some **bold** text and more words");
    paragraph.take(parser, "Some **bold** text", {});
    paragraph.keep(shown);
    const node = paragraph.nodeOf(parser.parse(" and more words", {}));

    expect([JSON.stringify(node), node.children[1] === shown.children[1]]).toEqual([JSON.stringify(shown), true]);
  });

  it("joins a link that ends the kept nodes, or starts the nodes after the cut, as the whole paragraph holds it", () => {
    const [ending, whole] = joinedOf("See https://example.com/a", " then https://example.com/b now");
    const [starting, wholeStarting] = joinedOf("See it", " https://example.com/a now");

    expect([ending, starting]).toEqual([whole, wholeStarting]);
  });
});
