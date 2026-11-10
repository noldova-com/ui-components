/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownTail } from "../../../src/app/models/markdown-tail";
import { MarkdownTailResources } from "../../../src/app/models/markdown-tail.resources";

describe("MarkdownTail", () => {
  const settled = (lines: readonly string[]): readonly string[] => lines.map(t => MarkdownTail.settledOf(t));

  it("shows a last block that opens nothing it doesn't close, and only looks at the last block", () => {
    expect(settled(["Plain text", "**a** and _b_ and ~~c~~", "* item", "a * b", "snake_case_name", "**a\n\nb", "use `a*b` here", "use `a\nb` here", ""]))
      .toEqual(["Plain text", "**a** and _b_ and ~~c~~", "* item", "a * b", "snake_case_name", "**a\n\nb", "use `a*b` here", "use `a\nb` here", ""]);
  });

  it("holds back the last block from its first emphasis that isn't closed yet, on any of its lines", () => {
    expect(settled(["Line one\nSome **bo", "**a", "_a", "~~gone", "*a _b", "**a** and *b", "_a_b", "Some **very\nimportant", "Intro\n\n*a\nb"]))
      .toEqual(["Line one\nSome ", "", "", "", "", "**a** and ", "", "Some ", "Intro\n\n"]);
  });

  it("holds back the last block from code, a link or an autolink that isn't closed yet, on any of its lines", () => {
    expect(settled(["use `code", "use `code\nmore", "see [docs\nmore", "see [docs](https://exa", "see [docs", "see ![alt](https://exa", "visit <https://exa", "see [docs] here", "[a](x) and more", "a < b", "<a> b"]))
      .toEqual(["use ", "use ", "see ", "see ", "see ", "see ", "visit ", "see [docs] here", "[a](x) and more", "a < b", "<a> b"]);
  });

  it("reads past a closed formula or code span, so a mark inside one holds nothing back, but holds back from one inside a formula still open", () => {
    expect(settled(["say $a*b$ now", "say \\(a_b * c\\) now", "say $$a*b$$ now", "say \\[a*b\\] now", "use `[` here", "use `<` here", "say $a*b", "$5 *and $10"]))
      .toEqual(["say $a*b$ now", "say \\(a_b * c\\) now", "say $$a*b$$ now", "say \\[a*b\\] now", "use `[` here", "use `<` here", "say $a", "$5 "]);
  });

  it("with math off, reads a formula's marks as the rest of the text, so a mark inside one holds back as any open mark does", () => {
    expect(["say $a*b$ now", "say $$a*b$$ now", "say \\[a*b\\] now", "kill $$ && echo $$"].map(t => MarkdownTail.settledOf(t, false)))
      .toEqual(["say $a", "say $$a", "say \\[a", "kill $$ && echo $$"]);
  });

  it("holds back at most its limit, and shows a longer open tail", () => {
    const limit = MarkdownTailResources.markdownHeldTailLimit;

    expect(settled([`x **${"a".repeat(limit - 2)}`, `x **${"a".repeat(limit - 1)}`])).toEqual(["x ", `x **${"a".repeat(limit - 1)}`]);
  });

  it("holds back a code fence's opening line, and a closing line that is still shorter than the fence, but shows the code inside an open fence", () => {
    expect(settled(["Intro\n\n```ts", "```", "Intro\n```ts\nlet a = 1;\n``", "Intro\n\n```ts\nlet a", "```\na\n\nb", "```\ncode\n```", "~~~\ncode `x\n~~~\nDone", "````\na\n```\nb",
      "```\ncode\n```\n\nAfter **b", "~~~\na\n``"]))
      .toEqual(["Intro\n\n", "", "Intro\n```ts\nlet a = 1;\n", "Intro\n\n```ts\nlet a", "```\na\n\nb", "```\ncode\n```", "~~~\ncode `x\n~~~\nDone", "````\na\n```\nb",
        "```\ncode\n```\n\nAfter ", "~~~\na\n``"]);
  });

  it("holds back a line that is only a block's marker, with no content yet", () => {
    expect(settled(["Text\n\n-", "Text\n\n#", "Text\n\n12.", "Text\n\n>", "Text\n\n- ", "Text\n\n- item", "Text\n\n## Title", "Text\n\n1. one"]))
      .toEqual(["Text\n\n", "Text\n\n", "Text\n\n", "Text\n\n", "Text\n\n- ", "Text\n\n- item", "Text\n\n## Title", "Text\n\n1. one"]);
  });

  it("holds back a table until its header has a delimiter row with a cell for each of its columns", () => {
    expect(settled(["| a | b |", "| a | b |\n", "| a | b |\n|---", "Intro\n\n| a | b |\n|-", "| a | b |\n|---|---|", "| a | b |\n|---|---|\n| 1 |", "| a | b |\n| :-- | --: |\n| 1 | 2 |",
      "a | b", "| a | b |\n| x | y |"]))
      .toEqual(["", "", "", "Intro\n\n", "| a | b |\n|---|---|", "| a | b |\n|---|---|\n| 1 |", "| a | b |\n| :-- | --: |\n| 1 | 2 |", "a | b", ""]);
  });

  it("holds back a fence's opening line or a marker however far back the text began, and nothing else open longer than its limit, a table header included", () => {
    const limit = MarkdownTailResources.markdownHeldTailLimit;
    const long = `| ${"a".repeat(limit)} |`;

    expect(settled([`${"x\n".repeat(limit)}\`\`\`ts`, `${"x\n".repeat(limit)}-`, `Intro\n\n${long}`, `*${"x".repeat(limit)}`, `*${"x".repeat(100)}`]))
      .toEqual([`${"x\n".repeat(limit)}`, `${"x\n".repeat(limit)}`, `Intro\n\n${long}`, `*${"x".repeat(limit)}`, ""]);
  });

  it("holds back emphasis until a run of its own mark and length closes it, and a mark that ends the text", () => {
    expect(settled(["Some **bold*", "Some *a **b** c*", "Some *a **b* c", "a **", "a ~~", "~~a~~ b", "__a__ b", "a_b_ c", "**a* b**", "_a_"]))
      .toEqual(["Some ", "Some *a **b** c*", "Some *a **b* c", "a ", "a ", "~~a~~ b", "__a__ b", "a_b_ c", "**a* b**", "_a_"]);
  });

  it("holds back a link until its label closes and is followed by more than an open destination, and a backslash that ends the text", () => {
    expect(settled(["see [docs]", "see [a [b] c", "see [a\\]b] here", "see [a [b] c] here", "see [a](b) and [c](d", "x](y", "x](y) z", "Hi! there", "see ![a]", "a \\", "a \\*b* c", "a \\[b",
      "*a [b", "*a `b"]))
      .toEqual(["see ", "see ", "see [a\\]b] here", "see [a [b] c] here", "see [a](b) and ", "x", "x](y) z", "Hi! there", "see ", "a ", "a \\*b* c", "a \\[b", "", ""]);
  });

  it("holds back code until a run of backticks of its own length closes it", () => {
    expect(settled(["use ``a`b`` here", "use ``a`b", "use ``a```b`` c"])).toEqual(["use ``a`b`` here", "use ", "use ``a```b`` c"]);
  });

  it("shows a single tilde, which strikes nothing through", () => {
    expect(settled(["~x", "a ~b"])).toEqual(["~x", "a ~b"]);
  });

  it("looks only at the end of a long line", () => {
    const text = "a".repeat(MarkdownTailResources.markdownTailScanLimit);
    const opens = "*a ".repeat(1_000_000);

    expect(settled([`${text} **b`, opens])).toEqual([`${text} `, opens]);
  });
});
