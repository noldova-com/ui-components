/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";
import markdownIt, { type MarkdownIt } from "markdown-it";

import { MarkdownNodeKind } from "../../../src/app/enums/markdown-node-kind";
import type { MarkdownNode } from "../../../src/app/models/markdown.node";
import { MarkdownTree } from "../../../src/app/models/markdown-tree";
import { MarkdownParser } from "../../../src/app/services/markdown.parser";
import { Resources } from "../../../src/resources";

describe("MarkdownTree", () => {
  const shapeOf = (node: MarkdownNode): unknown[] =>
    [node.kind, ...[node.text, node.value, node.href, node.language, node.align, node.title].filter(t => t !== String.empty && t !== 0 && !Object.isNull(t)), ...node.children.map(shapeOf)];
  const textOf = (nodes: readonly MarkdownNode[]): string => nodes.map(t => t.text + textOf(t.children)).join(String.empty);
  const countOf = (nodes: readonly MarkdownNode[], kind: MarkdownNodeKind): number =>
    nodes.reduce((count, t) => count + (t.kind === kind ? 1 : 0) + countOf(t.children, kind), 0);
  const depthOf = (nodes: readonly MarkdownNode[]): number =>
    Math.max(0, ...nodes.filter(t => t.children.length > 0).map(t => (Resources.markdownPartKinds.has(t.kind) ? 0 : 1) + depthOf(t.children)));
  const treeAsync = async (source: string): Promise<readonly MarkdownNode[]> =>
    MarkdownTree.of((await TestBed.inject(MarkdownParser).parserAsync() as MarkdownIt).parse(source, {}));
  const list = (depth: number, last: string): string =>
    Array.from({ length: depth }, (_, index) => `${"  ".repeat(index)}- ${index === depth - 1 ? last : `item ${index + 1}`}`).join("\n");

  it("builds a node for each kind of block, with its level, start, language and alignment", async () => {
    const source = [
      "## Title", "", "Text", "", "> Quote", "", "- one", "- two", "", "3. three", "4. four", "", "1) first", "", "```ts sample", "let a;", "```", "",
      "    plain code", "", "---", "", "| a | b | c |", "|:--|:-:|---|", "| 1 | 2 | 3 |"
    ].join("\n");

    const shapes = (await treeAsync(source)).map(shapeOf);

    expect(shapes).toEqual([
      [MarkdownNodeKind.Heading, 2, [MarkdownNodeKind.Text, "Title"]],
      [MarkdownNodeKind.Paragraph, [MarkdownNodeKind.Text, "Text"]],
      [MarkdownNodeKind.Quote, [MarkdownNodeKind.Paragraph, [MarkdownNodeKind.Text, "Quote"]]],
      [MarkdownNodeKind.BulletList, [MarkdownNodeKind.ListItem, [MarkdownNodeKind.Text, "one"]], [MarkdownNodeKind.ListItem, [MarkdownNodeKind.Text, "two"]]],
      [MarkdownNodeKind.OrderedList, 3, [MarkdownNodeKind.ListItem, [MarkdownNodeKind.Text, "three"]], [MarkdownNodeKind.ListItem, [MarkdownNodeKind.Text, "four"]]],
      [MarkdownNodeKind.OrderedList, 1, [MarkdownNodeKind.ListItem, [MarkdownNodeKind.Text, "first"]]],
      [MarkdownNodeKind.Code, "let a;", "ts"],
      [MarkdownNodeKind.Code, "plain code"],
      [MarkdownNodeKind.Rule],
      [MarkdownNodeKind.Table,
        [MarkdownNodeKind.TableHead, [MarkdownNodeKind.TableRow,
          [MarkdownNodeKind.TableHeaderCell, "left", [MarkdownNodeKind.Text, "a"]],
          [MarkdownNodeKind.TableHeaderCell, "center", [MarkdownNodeKind.Text, "b"]],
          [MarkdownNodeKind.TableHeaderCell, [MarkdownNodeKind.Text, "c"]]]],
        [MarkdownNodeKind.TableBody, [MarkdownNodeKind.TableRow,
          [MarkdownNodeKind.TableCell, "left", [MarkdownNodeKind.Text, "1"]],
          [MarkdownNodeKind.TableCell, "center", [MarkdownNodeKind.Text, "2"]],
          [MarkdownNodeKind.TableCell, [MarkdownNodeKind.Text, "3"]]]]]
    ]);
  });

  it("marks a code block whose fence never closed, at any depth, and no other", async () => {
    const shapes = await Promise.all(["```ts\nlet a;", "```", "~~~\na\n```", "> ```\n> a\n\nb", "```\na\n```", "    a"].map(async t => (await treeAsync(t)).map(shapeOf)));

    expect(shapes).toEqual([
      [[MarkdownNodeKind.Code, "let a;", 1, "ts"]], [[MarkdownNodeKind.Code, 1]], [[MarkdownNodeKind.Code, "a\n```", 1]],
      [[MarkdownNodeKind.Quote, [MarkdownNodeKind.Code, "a", 1]], [MarkdownNodeKind.Paragraph, [MarkdownNodeKind.Text, "b"]]], [[MarkdownNodeKind.Code, "a"]], [[MarkdownNodeKind.Code, "a"]]
    ]);
  });

  it("builds a node for each kind of inline text, and an image node with its alt text, address and title", async () => {
    const source = "*a* **b** ~~c~~ `d` [e](https://example.com/e)\nf  \ng ![h *i* ![j](https://example.com/j.png)](https://example.com/h.png \"H\")";

    const shapes = (await treeAsync(source)).map(shapeOf);

    expect(shapes).toEqual([[MarkdownNodeKind.Paragraph,
      [MarkdownNodeKind.Emphasis, [MarkdownNodeKind.Text, "a"]], [MarkdownNodeKind.Text, " "],
      [MarkdownNodeKind.Strong, [MarkdownNodeKind.Text, "b"]], [MarkdownNodeKind.Text, " "],
      [MarkdownNodeKind.Strikethrough, [MarkdownNodeKind.Text, "c"]], [MarkdownNodeKind.Text, " "],
      [MarkdownNodeKind.InlineCode, "d"], [MarkdownNodeKind.Text, " "],
      [MarkdownNodeKind.Link, "https://example.com/e", [MarkdownNodeKind.Text, "e"]],
      [MarkdownNodeKind.SoftBreak, "\n"],
      [MarkdownNodeKind.Text, "f"], [MarkdownNodeKind.HardBreak],
      [MarkdownNodeKind.Text, "g "], [MarkdownNodeKind.Image, "h i j", "https://example.com/h.png", "H"]
    ]]);
  });

  it("joins a text run into one node, entities included, and keeps each backslash escape a node of its own", async () => {
    const shapes = (await treeAsync("a &amp; b \\@ada and \\\\ c")).map(shapeOf);

    expect(shapes).toEqual([[MarkdownNodeKind.Paragraph, [MarkdownNodeKind.Text, "a & b "], [MarkdownNodeKind.Text, "@"], [MarkdownNodeKind.Text, "ada and "],
      [MarkdownNodeKind.Text, "\\"], [MarkdownNodeKind.Text, " c"]]]);
  });

  it("keeps raw HTML as text, in a block and inline", async () => {
    const source = "<script>alert(1)</script>\n\nA <b onclick=\"alert(1)\">bold</b> <img src=x onerror=alert(1)> word";

    const nodes = await treeAsync(source);

    expect(nodes.map(shapeOf)).toEqual([
      [MarkdownNodeKind.Paragraph, [MarkdownNodeKind.Text, "<script>alert(1)</script>"]],
      [MarkdownNodeKind.Paragraph, [MarkdownNodeKind.Text, "A <b onclick=\"alert(1)\">bold</b> <img src=x onerror=alert(1)> word"]]
    ]);
  });

  it("makes links only of http, https and mailto addresses, from links, autolinks, references and bare addresses", async () => {
    const source = "[a](https://example.com/a) <http://example.com/b> [c][c] https://example.com/d <e@example.com> f@example.com [g](MAILTO:g@example.com)\n\n"
      + "[c]: https://example.com/c";

    const nodes = await treeAsync(source);

    expect(countOf(nodes, MarkdownNodeKind.Link)).toBe(7);
    expect(JSON.stringify(nodes.map(shapeOf))).toContain("\"Link\",\"https://example.com/c\"");
    expect(JSON.stringify(nodes.map(shapeOf))).toContain("\"Link\",\"mailto:e@example.com\"");
  });

  it("builds an image node for an image of any address, with no title when it has none, and leaves an image in code as text", async () => {
    const source = "![a](charts/a.png) ![](data:image/png;base64,AAAA) ![c](javascript:alert(1)) `![d](d.png)`\n\n```\n![e](e.png)\n```";

    const shapes = (await treeAsync(source)).map(shapeOf);

    expect(shapes).toEqual([
      [MarkdownNodeKind.Paragraph,
        [MarkdownNodeKind.Image, "a", "charts/a.png"], [MarkdownNodeKind.Text, " "], [MarkdownNodeKind.Image, "data:image/png;base64,AAAA"], [MarkdownNodeKind.Text, " "],
        [MarkdownNodeKind.Image, "c", "javascript:alert(1)"], [MarkdownNodeKind.Text, " "], [MarkdownNodeKind.InlineCode, "![d](d.png)"]],
      [MarkdownNodeKind.Code, "![e](e.png)"]
    ]);
    expect((await treeAsync("![a](a.png)"))[0]?.children[0]?.title).toBeNull();
  });

  it("gives an image's alt text a space for each line break in it, and the alt text of an image inside it, flattened", async () => {
    const shapes = (await treeAsync("![a\nb](x.png) ![c  \nd](y.png) ![chart ![logo](l.png)](charts/c.png)")).map(shapeOf);

    expect(shapes).toEqual([[MarkdownNodeKind.Paragraph,
      [MarkdownNodeKind.Image, "a b", "x.png"], [MarkdownNodeKind.Text, " "], [MarkdownNodeKind.Image, "c d", "y.png"], [MarkdownNodeKind.Text, " "],
      [MarkdownNodeKind.Image, "chart logo", "charts/c.png"]]]);
  });

  it("leaves a link to any other address as its text, whatever its case, encoding, spacing or form", async () => {
    const sources = [
      "[a](JaVaScRiPt:alert(1))", "[a](jav&#x61;script:alert(1))", "[a](&#106;avascript:alert(1))", "[a](data:text/html;base64,PHNjcmlwdD4=)",
      "[a](vbscript:msgbox(1))", "[a]( javascript:alert(1))", "[a](\u0001javascript:alert(1))", "[a](//example.com/a)", "[a](\\\\\\\\host/a)", "[a](#top)",
      "<javascript:alert(1)>", "<data:text/html,x>", "[a][r]\n\n[r]: javascript:alert(1)", "[a][r]\n\n[r]: file:///docs/a", "![a](data:image/png;base64,AAAA)"
    ];

    const results = await Promise.all(sources.map(async t => countOf(await treeAsync(t), MarkdownNodeKind.Link)));

    expect(results).toEqual(sources.map(() => 0));
  });

  it("links a relative, a rooted or a Windows drive path, directly or by reference, for the view to show as its app asks", async () => {
    const sources = ["[a](docs/a)", "[a](/docs/a)", "[a](C:\\docs\\a)", "[a][r]\n\n[r]: ../docs/a"];

    const results = await Promise.all(sources.map(async t => countOf(await treeAsync(t), MarkdownNodeKind.Link)));

    expect(results).toEqual(sources.map(() => 1));
  });

  it("checks a link's address itself too, so a parser that allows more still gets no link to it", () => {
    const nodes = MarkdownTree.of(markdownIt().parse("[a](//example.com/a) [b](data:image/png;base64,AAAA) [c](https://example.com/c)", {}));

    expect(nodes.map(shapeOf)).toEqual([[MarkdownNodeKind.Paragraph,
      [MarkdownNodeKind.Text, "a"], [MarkdownNodeKind.Text, " "], [MarkdownNodeKind.Text, "b"], [MarkdownNodeKind.Text, " "],
      [MarkdownNodeKind.Link, "https://example.com/c", [MarkdownNodeKind.Text, "c"]]]]);
  });

  it("keeps the text of a container it doesn't know, without the container", () => {
    const tokens = markdownIt().parse("a", {});
    Object.assign(tokens[0] as object, { type: "aside_open" });

    expect(MarkdownTree.of(tokens).map(shapeOf)).toEqual([[MarkdownNodeKind.Text, "a"]]);
  });

  it("nests quotes as deep as their limit, and keeps the text of deeper quotes in the deepest one", async () => {
    const deep = await treeAsync(`${"> ".repeat(Resources.markdownQuoteDepthLimit)}a`);
    const deeper = await treeAsync(`${"> ".repeat(Resources.markdownQuoteDepthLimit)}a\n${"> ".repeat(Resources.markdownQuoteDepthLimit + 1)}b`);
    const deepest = await treeAsync(`${"> ".repeat(Resources.markdownQuoteDepthLimit + 1)}c`);

    expect([countOf(deep, MarkdownNodeKind.Quote), countOf(deeper, MarkdownNodeKind.Quote), countOf(deepest, MarkdownNodeKind.Quote)])
      .toEqual([Resources.markdownQuoteDepthLimit, Resources.markdownQuoteDepthLimit, Resources.markdownQuoteDepthLimit]);
    expect([textOf(deep), textOf(deeper), textOf(deepest)]).toEqual(["a", "ab", "c"]);
    expect(countOf(deeper, MarkdownNodeKind.Paragraph)).toBe(2);
  });

  it("nests lists as deep as their limit, and keeps the items of deeper lists in the deepest one, each on its own line", async () => {
    const deep = await treeAsync(list(Resources.markdownListDepthLimit, "last"));
    const deeper = await treeAsync(list(Resources.markdownListDepthLimit + 2, "last"));
    const fence = "```";
    const code = await treeAsync([list(Resources.markdownListDepthLimit, "last"), `${"  ".repeat(Resources.markdownListDepthLimit)}- ${fence}`,
      `${"  ".repeat(Resources.markdownListDepthLimit + 1)}code`, `${"  ".repeat(Resources.markdownListDepthLimit + 1)}${fence}`].join("\n"));

    expect([countOf(deep, MarkdownNodeKind.BulletList), countOf(deeper, MarkdownNodeKind.BulletList), countOf(code, MarkdownNodeKind.BulletList)])
      .toEqual([Resources.markdownListDepthLimit, Resources.markdownListDepthLimit, Resources.markdownListDepthLimit]);
    expect([countOf(deep, MarkdownNodeKind.HardBreak), countOf(deeper, MarkdownNodeKind.HardBreak), countOf(code, MarkdownNodeKind.HardBreak)]).toEqual([0, 2, 0]);
    expect(textOf(deeper)).toBe("item 1item 2item 3item 4item 5item 6item 7item 8item 9last");
    expect(textOf(code)).toBe("item 1item 2item 3item 4item 5item 6item 7lastcode");
  });

  it("nests elements as deep as their limit, and keeps the text of deeper ones in the deepest one", async () => {
    const blocks = Resources.markdownQuoteDepthLimit + Resources.markdownListDepthLimit;
    const quoted = (inline: string): string => list(Resources.markdownListDepthLimit, inline).split("\n").map(t => `${"> ".repeat(Resources.markdownQuoteDepthLimit)}${t}`).join("\n");
    const wrapped = (depth: number): string =>
      Array.from({ length: depth }, (_, index) => index).reduce((text, index) => index % 2 === 0 ? `*a ${text} b*` : `_a ${text} b_`, "core");

    const deep = await treeAsync(quoted(wrapped(Resources.markdownNestingLimit - blocks)));
    const deeper = await treeAsync(quoted(wrapped(Resources.markdownNestingLimit - blocks + 1)));

    expect([depthOf(deep), depthOf(deeper)]).toEqual([Resources.markdownNestingLimit, Resources.markdownNestingLimit]);
    expect([countOf(deep, MarkdownNodeKind.Emphasis), countOf(deeper, MarkdownNodeKind.Emphasis)])
      .toEqual([Resources.markdownNestingLimit - blocks, Resources.markdownNestingLimit - blocks]);
    expect(textOf(deeper)).toContain("a a a a a a a a a core b b b b b b b b b");
  });

  it("makes a task of an item that starts with a box, checked or not, in tight and loose lists, keeping the empty text the parser leaves after strong text", async () => {
    const tight = ["- [ ] open", "- [x] done", "- [X] **bold**", "- [ ]", "- [y] other", "- [ ]close"].join("\n");
    const loose = ["- [x] first", "", "  more", "- [ ] second"].join("\n");

    const shapes = [...await treeAsync(tight), ...await treeAsync(loose)].map(shapeOf);

    expect(shapes).toEqual([
      [MarkdownNodeKind.BulletList,
        [MarkdownNodeKind.TaskItem, [MarkdownNodeKind.Text, "open"]],
        [MarkdownNodeKind.TaskItem, 1, [MarkdownNodeKind.Text, "done"]],
        [MarkdownNodeKind.TaskItem, 1, [MarkdownNodeKind.Strong, [MarkdownNodeKind.Text, "bold"]], [MarkdownNodeKind.Text]],
        [MarkdownNodeKind.TaskItem],
        [MarkdownNodeKind.ListItem, [MarkdownNodeKind.Text, "[y] other"]],
        [MarkdownNodeKind.ListItem, [MarkdownNodeKind.Text, "[ ]close"]]],
      [MarkdownNodeKind.BulletList,
        [MarkdownNodeKind.TaskItem, 1, [MarkdownNodeKind.Paragraph, [MarkdownNodeKind.Text, "first"]], [MarkdownNodeKind.Paragraph, [MarkdownNodeKind.Text, "more"]]],
        [MarkdownNodeKind.TaskItem, [MarkdownNodeKind.Paragraph, [MarkdownNodeKind.Text, "second"]]]]
    ]);
  });

  it("makes no task of an item that starts with another block, or is empty", async () => {
    const shapes = (await treeAsync("- # [ ] a\n-")).map(shapeOf);

    expect(shapes).toEqual([
      [MarkdownNodeKind.BulletList, [MarkdownNodeKind.ListItem, [MarkdownNodeKind.Heading, 1, [MarkdownNodeKind.Text, "[ ] a"]]], [MarkdownNodeKind.ListItem]]
    ]);
  });

  it("builds nothing where a link reference is defined", async () => {
    const shapes = (await treeAsync("[r]: https://example.com/\n\n> [s]: https://example.com/s\n\nText")).map(shapeOf);

    expect(shapes).toEqual([[MarkdownNodeKind.Quote], [MarkdownNodeKind.Paragraph, [MarkdownNodeKind.Text, "Text"]]]);
  });
});
