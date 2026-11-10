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
import type { ILinkReferenceSource } from "../../../src/app/interfaces/i-link-reference-source";
import { LinkReferenceMatch } from "../../../src/app/models/link-reference-match";
import type { MarkdownNode } from "../../../src/app/models/markdown.node";
import { MarkdownReader } from "../../../src/app/models/markdown.reader";
import { MarkdownLinkSchemes } from "../../../src/app/models/markdown-link-schemes";
import { MarkdownOpenParagraph } from "../../../src/app/models/markdown-open-paragraph";
import { MarkdownTail } from "../../../src/app/models/markdown-tail";
import { MarkdownTree } from "../../../src/app/models/markdown-tree";
import { MarkdownParser } from "../../../src/app/services/markdown.parser";
import { Resources } from "../../../src/resources";
import { MarkdownReaderResources } from "../../../src/app/models/markdown-reader.resources";

describe("MarkdownReader", () => {
  let parser: MarkdownIt;
  let reader: MarkdownReader;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    parser = await TestBed.inject(MarkdownParser).parserAsync() as MarkdownIt;
    reader = new MarkdownReader();
  });

  const kindsOf = (nodes: readonly MarkdownNode[]): readonly MarkdownNodeKind[] => nodes.map(t => t.kind);
  const textOf = (nodes: readonly MarkdownNode[]): string => nodes.map(t => t.text + textOf(t.children)).join(String.empty);

  it("keeps the nodes of the blocks whose source didn't change, and builds the changed ones again", () => {
    const first = reader.read(parser, "# Title\n\nOne", false);
    const second = reader.read(parser, "# Title\n\nOne two", false);

    expect([second[0] === first[0], second[1] === first[1], textOf(second)]).toEqual([true, false, "TitleOne two"]);
  });

  it("keeps the nodes inside a block it builds again that come out the same, and the block it showed once it settles", () => {
    const first = reader.read(parser, "Some **bold** text", true);
    const second = reader.read(parser, "Some **bold** text and more", true);
    const third = reader.read(parser, "Some **bold** text and more\n\nNext", true);
    const fourth = reader.read(parser, "Some **bold** text and more\n\nNext", true);

    expect([second[0] === first[0], second[0]?.children[0] === first[0]?.children[0], second[0]?.children[1] === first[0]?.children[1], third[0] === second[0],
      fourth[1] === third[1]]).toEqual([false, true, true, true, true]);
  });

  it("parses only from the first block that later text could still change", () => {
    const parse = vi.spyOn(parser, "parse");

    reader.read(parser, "# Title\n\nOne", false);
    reader.read(parser, "# Title\n\nOne two\n\nThree", false);
    reader.read(parser, "# Title\n\nOne two\n\nThree four", false);

    expect(parse.mock.calls.map(t => t[0])).toEqual(["# Title\n\nOne", "One two\n\nThree", "Three four"]);
  });

  it("parses the block before the last one again when no blank line parts them, since a definition can take its next lines as a title", () => {
    const parse = vi.spyOn(parser, "parse");

    const open = reader.read(parser, "Text\n\n[r]: https://example.com/\n\"Ti", false);
    const closed = reader.read(parser, "Text\n\n[r]: https://example.com/\n\"Title\"", false);

    expect([kindsOf(open), kindsOf(closed)]).toEqual([[MarkdownNodeKind.Paragraph, MarkdownNodeKind.Paragraph], [MarkdownNodeKind.Paragraph]]);
    expect(parse.mock.calls.map(t => t[0])).toEqual(["Text\n\n[r]: https://example.com/\n\"Ti", "[r]: https://example.com/\n\"Title\""]);
  });

  it("reads a text that doesn't extend the last one from its start", () => {
    const first = reader.read(parser, "A\n\nB", false);
    reader.read(parser, "C", false);
    const third = reader.read(parser, "A\n\nB", false);

    expect([third[0] === first[0], textOf(third)]).toEqual([false, "AB"]);
  });

  it("builds every block again when a reference is defined later, so an earlier link resolves, and keeps the blocks that come out the same", () => {
    const first = reader.read(parser, "[a][r]\n\nText", false);
    const second = reader.read(parser, "[a][r]\n\nText\n\n[r]: https://example.com/", false);

    expect([second[0] === first[0], second[1] === first[1], second[0]?.children[0]?.kind]).toEqual([false, true, MarkdownNodeKind.Link]);
  });

  it("builds every block again when a reference's address changes", () => {
    reader.read(parser, "[a][r]\n\n[r]: https://example.com/", false);
    const nodes = reader.read(parser, "[a][r]\n\n[r]: https://example.com/b", false);

    expect(nodes[0]?.children[0]?.href).toBe("https://example.com/b");
  });

  it("keeps the references defined in the blocks it no longer parses, also inside other blocks, for the links after them", () => {
    const parse = vi.spyOn(parser, "parse");

    const first = reader.read(parser, "> [r]: https://example.com/\n\nText", false);
    const second = reader.read(parser, "> [r]: https://example.com/\n\nText\n\n[a][r]", false);

    expect([second[0] === first[0], second.at(-1)?.children[0]?.href, parse.mock.calls.length]).toEqual([true, "https://example.com/", 2]);
  });

  it("keeps the first definition of a label it no longer parses", () => {
    const first = reader.read(parser, "[r]: https://example.com/a\n\n[r]: https://example.com/b\n\n[a][r]\n\nEnd", false);
    const second = reader.read(parser, "[r]: https://example.com/a\n\n[r]: https://example.com/b\n\n[a][r]\n\nEnd here", false);

    expect([second[0] === first[0], second[0]?.children[0]?.href, textOf(second)]).toEqual([true, "https://example.com/a", "aEnd here"]);
  });

  it("builds every block again when the text defines another reference in place of one it defined", () => {
    const parse = vi.spyOn(parser, "parse");

    reader.read(parser, "Text\n\n[r]: https://example.com/", false);
    reader.read(parser, "Text\n\n[s]: https://example.com/", false);

    expect(parse.mock.calls.map(t => t[0])).toEqual(["Text\n\n[r]: https://example.com/", "[s]: https://example.com/", "Text\n\n[s]: https://example.com/"]);
  });

  const wholeOf = (text: string, isStreaming: boolean): string => JSON.stringify(MarkdownTree.of(parser.parse(isStreaming ? MarkdownTail.settledOf(text) : text, {})));
  const unlikeWholeOf = (text: string, from: number = 0): readonly string[] => [
    ...Array.from({ length: text.length - from }, (_, index) => [text.slice(0, from + index + 1), true] as const), [text, false] as const
  ].filter(([prefix, isStreaming]) => JSON.stringify(reader.read(parser, prefix, isStreaming)) !== wholeOf(prefix, isStreaming)).map(([prefix]) => prefix);

  describe("a streamed list", () => {
    const itemsOf = (count: number, item: (index: number) => string): string => Array.from({ length: count }, (_, index) => item(index)).join("\n");

    it("reads as the whole text does at every length, while its items are tight", () => {
      expect(unlikeWholeOf(`Intro\n\n${itemsOf(8, t => `- Item ${t} with **bold** and \`code\``)}\n\nAfter`)).toEqual([]);
    });

    it("reads as the whole text does when a blank line between later items makes it loose", () => {
      expect(unlikeWholeOf(`${itemsOf(5, t => `- Item ${t}`)}\n\n- Six\n- Seven\n\nAfter`)).toEqual([]);
    });

    it("reads as the whole text does when a later item's blank line makes it loose", () => {
      expect(unlikeWholeOf(`${itemsOf(4, t => `- Item ${t}`)}\n- Five\n\n  more of five\n- Six\n- Seven`)).toEqual([]);
    });

    it("reads as the whole text does when a blank line after its last item ends it, and when a rule or more text follows", () => {
      expect([unlikeWholeOf("- a\n- b\n- c\n- d\n\n---\n\nAfter"), unlikeWholeOf("- a\n- b\n- c\n- d\n\n")]).toEqual([[], []]);
    });

    it("reads as the whole text does when another marker or delimiter starts another list", () => {
      expect([unlikeWholeOf("3) three\n4) four\n5) five\n6) six\n7. seven\n8. eight"), unlikeWholeOf("- a\n- b\n- c\n- d\n* e\n* f\n* g")]).toEqual([[], []]);
    });

    it("reads as the whole text does when its items hold code with blank lines, nested lists, tasks or an empty item", () => {
      expect([
        unlikeWholeOf("- a\n- b\n- c\n  ```\n  x\n\n  y\n  ```\n- d\n- e\n- f"),
        unlikeWholeOf("- a\n- b\n  - b1\n\n  - b2\n- c\n- d\n- e"),
        unlikeWholeOf("- a\n- b\n- c\n  - c1\n\n  more of c\n- d\n- e"),
        unlikeWholeOf("- [ ] a\n- [x] b\n- [ ] c\n- d\n- e"),
        unlikeWholeOf("- a\n- b\n- c\n-\n\n  foo\n- d\n- e")
      ]).toEqual([[], [], [], [], []]);
    });

    it("reads as the whole text does when lines that look like rules, underlines, code or lazy text follow its items", () => {
      expect([
        unlikeWholeOf("- a\n- b\n- c\n- - -\n- e\n- f"),
        unlikeWholeOf("- a\n- b\n- c\n--\n- d\n- e"),
        unlikeWholeOf("- a\n- b\n- c\n\n    code\n- d\n- e"),
        unlikeWholeOf("Intro:\n- a\n- b\nlazy\n- c\n- d")
      ]).toEqual([[], [], [], []]);
    });

    it("reads as the whole text does when its items define and use references", () => {
      expect(unlikeWholeOf("- [one][r]\n- two\n- three\n- [r]: https://example.com/\n- five\n- [six][r]\n- seven")).toEqual([]);
    });

    it("parses only its last two items once a third follows them, with the blocks before it", () => {
      const parse = vi.spyOn(parser, "parse");

      reader.read(parser, "Intro\n\n- a\n- b\n- c", true);
      reader.read(parser, "Intro\n\n- a\n- b\n- c\n- d", true);
      reader.read(parser, "Intro\n\n- a\n- b\n- c\n- d\n\nAfter", true);

      expect(parse.mock.calls.map(t => t[0])).toEqual(["Intro\n\n- a\n- b\n- c", "- b\n- c\n- d", "- c\n- d\n\nAfter"]);
    });

    it("keeps the nodes of the items it no longer parses, and of those that come out the same", () => {
      const first = reader.read(parser, "- a\n- b\n- c\n- d", true);
      const second = reader.read(parser, "- a\n- b\n- c\n- d\n- e", true);

      expect([second[0] === first[0], first[0]?.children.map((t, i) => t === second[0]?.children[i])]).toEqual([false, [true, true, true, true]]);
    });
  });

  describe("a streamed paragraph", () => {
    const step = MarkdownReaderResources.markdownParagraphStep;
    const margin = MarkdownReaderResources.markdownParagraphMargin;
    const fillerOf = (length: number): string => "lorem ".repeat(Math.ceil(length / 6)).slice(0, length);
    const acrossOf = (inline: string): string => `${fillerOf(step - 15)} ${inline} ${fillerOf(step + margin + 300)}`;
    const afterChange = 60;
    const canSkip = (text: string, length: number, cuts: number): boolean => {
      const firstBreak = text.indexOf("\n");
      return length > step - 19 && (firstBreak < 0 || length <= firstBreak) && length <= (cuts + 1) * step + margin;
    };
    const unlikeLengthsOf = (text: string): readonly number[] => {
      const keep = vi.spyOn(MarkdownOpenParagraph.prototype, "keep");
      const before = keep.mock.calls.length;
      const unlike: number[] = [];
      let left = 0;
      for (let length = step - 19; length <= text.length; length++) {
        if (left === 0 && length <= text.length - afterChange && canSkip(text, length, keep.mock.calls.length - before))
          continue;
        const cuts = keep.mock.calls.length;
        const read = reader.read(parser, text.slice(0, length), true);
        left = keep.mock.calls.length > cuts || text[length - 1] === "\n" || length > text.length - afterChange ? afterChange + 1 : left;
        if (left > 0 && JSON.stringify(read) !== wholeOf(text.slice(0, length), true))
          unlike.push(length);
        left = Math.max(left - 1, 0);
      }
      return JSON.stringify(reader.read(parser, text, false)) === wholeOf(text, false) ? unlike : [...unlike, text.length];
    };

    it("cuts at the same lengths when it skips every length that can't cut as when it reads every length, across two cuts", () => {
      const text = acrossOf("some **bold** words");
      const cutsOf = (skips: boolean): readonly number[] => {
        reader = new MarkdownReader();
        const keep = vi.spyOn(MarkdownOpenParagraph.prototype, "keep");
        const before = keep.mock.calls.length;
        const cuts: number[] = [];
        for (let length = step - 19; length <= text.length; length++)
          if (!skips || !canSkip(text, length, cuts.length)) {
            reader.read(parser, text.slice(0, length), true);
            if (keep.mock.calls.length - before > cuts.length)
              cuts.push(length);
          }
        return cuts;
      };
      const skipped = cutsOf(true);

      expect([skipped, skipped.length]).toEqual([cutsOf(false), 2]);
    });

    it("reads every length from 981 characters at which it may cut, across three cuts, while its emphasis, code, links and images close before each cut, as the whole text does at the 60 lengths after each cut and each line break, and at the last 60", () => {
      const sentence = "Some **bold** and *slanted* text, `code [0]`, ~~struck~~, a [link](https://example.com/) and ![image](https://example.com/a.png), "
        + "bare https://example.com/a, snake_case_names, 2 * 3 and a closer-only star* in it. ";
      const keep = vi.spyOn(MarkdownOpenParagraph.prototype, "keep");

      expect([unlikeLengthsOf(sentence.repeat(Math.ceil((step * 3 + margin) / sentence.length))), keep.mock.calls.length]).toEqual([[], 3]);
    });

    it("reads as the whole text does when emphasis or strikethrough opens before a cut and closes after it", () => {
      expect([
        unlikeLengthsOf(acrossOf("**bold words across the cut**")),
        unlikeLengthsOf(acrossOf("_slanted words across the cut_")),
        unlikeLengthsOf(acrossOf("~~struck words across the cut~~"))
      ]).toEqual([[], [], []]);
    });

    it("reads as the whole text does when a link, an image or a code span opens before a cut and closes after it", () => {
      expect([
        unlikeLengthsOf(acrossOf("[link words across the cut](https://example.com/)")),
        unlikeLengthsOf(acrossOf("![image words across the cut](https://example.com/a.png)")),
        unlikeLengthsOf(acrossOf("`` code words with ` across the cut ``"))
      ]).toEqual([[], [], []]);
    });

    it("reads as the whole text does when a later line makes it a heading, a table or a longer paragraph, or ends it", () => {
      const line = `${fillerOf(step + margin + 200)} a | b`;

      expect([
        unlikeLengthsOf(`${line}\n===\n\nAfter`),
        unlikeLengthsOf(`${line}\n---`),
        unlikeLengthsOf(`${line}\n--- | ---\n1 | 2`),
        unlikeLengthsOf(`${line}  \nmore of it\n\nAfter`),
        unlikeLengthsOf(`${line}\n# Heading\n\n${fillerOf(step + margin + 100)}`)
      ]).toEqual([[], [], [], [], []]);
    });

    it("reads as the whole text does when the text after a cut would start another block on its own line", () => {
      expect(unlikeLengthsOf(acrossOf("so # not a heading - not a list 1. not a list > not a quote    not code | not a cell"))).toEqual([]);
    });

    it("reads as the whole text does when its earlier lines end in hard breaks, and when it ends in spaces", () => {
      expect([
        unlikeLengthsOf(`first line  \nsecond line\\\n${acrossOf("third line")}`),
        unlikeLengthsOf(`${acrossOf("words")}   `)
      ]).toEqual([[], []]);
    });

    it("reads as the whole text does when an escaped mark or an entity comes before a cut", () => {
      expect([
        unlikeLengthsOf(acrossOf("an \\*escaped\\* star, an \\[escaped\\] bracket and an \\` escaped backtick")),
        unlikeLengthsOf(acrossOf("an &ast;entity star&ast;, an &lbrack;entity bracket and an &grave; entity backtick"))
      ]).toEqual([[], []]);
    });

    it("reads as the whole text does when a bare link ends at a cut or starts the text after one", () => {
      const link = " https://example.com/a";

      expect(unlikeLengthsOf(`${fillerOf(step - link.length + 1)}${link} ${fillerOf(step)}${link} ${fillerOf(margin + 300)}`)).toEqual([]);
    });

    it("reads as the whole text does when it uses references defined before it, or defined after it later", () => {
      expect([
        unlikeLengthsOf(`[r]: https://example.com/\n\n${acrossOf("a [reference][r] here")}`),
        unlikeLengthsOf(`${acrossOf("a [later][s] one")}\n\n[s]: https://example.com/`)
      ]).toEqual([[], []]);
    });

    it("reads a shorter text that ends at its last cut as the whole text does", () => {
      const parse = vi.spyOn(parser, "parse");
      const text = fillerOf(step * 3);
      for (let end = 100; end <= text.length; end += 100)
        reader.read(parser, text.slice(0, end), true);
      reader.read(parser, text, true);
      const cut = text.length - (parse.mock.calls.at(-1)?.[0].length ?? 0);

      expect([cut > step, JSON.stringify(reader.read(parser, text.slice(0, cut), true))]).toEqual([true, wholeOf(text.slice(0, cut), true)]);
    });

    it("parses only the text after its last cut once it is longer than a step and a margin, in updates of 100 characters", () => {
      const parse = vi.spyOn(parser, "parse");
      const text = fillerOf(step * 10);

      for (let end = 100; end <= text.length; end += 100)
        reader.read(parser, text.slice(0, end), true);

      expect(Math.max(...parse.mock.calls.slice(30).map(t => t[0].length))).toBeLessThan(step + margin + 200);
    });

    it("keeps cutting in updates of 20 characters when every cut tried a step after a refused one would land in an open image", () => {
      const parse = vi.spyOn(parser, "parse");
      const sentence = "Some **bold** and *slanted* text, `code [0]`, ~~struck~~, a [link](https://example.com/) and ![an image](https://example.com/a.png), "
        + "a bare www.example.com address, snake_case_names, 2 * 3 and a closer-only star* in it. ";
      const text = sentence.repeat(Math.ceil(step * 6 / sentence.length));

      for (let end = 20; end <= text.length; end += 20)
        reader.read(parser, text.slice(0, end), true);

      expect([Math.max(...parse.mock.calls.map(t => t[0].length)) < step + margin + 200, JSON.stringify(reader.read(parser, text, false))])
        .toEqual([true, wholeOf(text, false)]);
    });

    it("parses it whole while an emphasis opened before every cut is still open", () => {
      const parse = vi.spyOn(parser, "parse");
      const text = `*${fillerOf(step * 3)}`;

      for (let end = 100; end <= text.length; end += 100)
        reader.read(parser, text.slice(0, end), true);
      const count = parse.mock.calls.length;
      reader.read(parser, text, true);

      expect(parse.mock.calls[count]?.[0]).toBe(text);
    });

    it("tries a cut it keeps refusing only a few times for each step of text, while an emphasis stays open", () => {
      const parse = vi.spyOn(parser, "parse");
      const text = `*${fillerOf(step * 4)}`;
      let updates = 0;

      for (let end = 20; end <= text.length; end += 20, updates++)
        reader.read(parser, text.slice(0, end), true);
      const steps = Math.ceil((text.length - step - margin) / step) + 1;

      expect(parse.mock.calls.length - updates).toBeLessThanOrEqual(MarkdownReaderResources.markdownParagraphRetries * steps);
    });
  });

  it("keeps the links with a scheme the view names in the list items it no longer parses, also once the list turns loose, and in the paragraph parts it no longer parses, as the whole text does, and reads the text again without them once the view names none", () => {
    const schemes = new MarkdownLinkSchemes(["example"]);
    const linksOf = (nodes: readonly MarkdownNode[]): readonly string[] => nodes.flatMap(t => [...t.kind === MarkdownNodeKind.Link ? [t.href] : [], ...linksOf(t.children)]);
    const wholeOf = (text: string): string => JSON.stringify(MarkdownTree.of(parser.parse(text, { [Resources.markdownLinkSchemesKey]: schemes }), schemes));
    const streamedOf = (text: string, by: number): readonly MarkdownNode[] => {
      for (let length = by; length < text.length; length += by)
        reader.read(parser, text.slice(0, length), true, schemes);
      return reader.read(parser, text, false, schemes);
    };
    const list = `${Array.from({ length: 5 }, (_, t) => `- [Chat ${t}](example:chat/${t})`).join("\n")}\n\n- [Chat 5](example:chat/5)`;
    const filler = "lorem ".repeat(400);
    const paragraph = `${filler.slice(0, MarkdownReaderResources.markdownParagraphStep)}[a](example:chat/a) ${filler}[b](example:chat/b) ${filler}`;
    const keep = vi.spyOn(MarkdownOpenParagraph.prototype, "keep");
    const listNodes = streamedOf(list, 1);
    const paragraphNodes = streamedOf(paragraph, 100);
    const kept = keep.mock.calls.length;

    expect([linksOf(listNodes), JSON.stringify(listNodes) === wholeOf(list), linksOf(paragraphNodes), JSON.stringify(paragraphNodes) === wholeOf(paragraph), kept > 0])
      .toEqual([Array.from({ length: 6 }, (_, t) => `example:chat/${t}`), true, ["example:chat/a", "example:chat/b"], true, true]);
    expect(linksOf(reader.read(parser, paragraph, false))).toEqual([]);
  });

  it("keeps what it has parsed when given other schemes with the same names, and reads the text again from its start for a name added, removed or changed", () => {
    const text = "First part.\n\nSecond [chat](example:chat/1) part.\n\nThird";
    reader.read(parser, text, false, new MarkdownLinkSchemes(["example"]));
    const parse = vi.spyOn(parser, "parse");
    const isWholeParse = (names: readonly string[]): boolean => {
      const before = parse.mock.calls.length;
      reader.read(parser, text, false, new MarkdownLinkSchemes(names));
      return parse.mock.calls[before]?.[0].length === text.length;
    };

    expect([["Example"], ["example", "chirp"], ["example"], ["chirp"]].map(t => isWholeParse(t))).toEqual([false, true, true, true]);
  });

  it("keeps math off in the list items and the paragraph parts it no longer parses, as the whole text does, and reads the text again with its formulas once math is on", () => {
    const formulasOf = (nodes: readonly MarkdownNode[]): number => nodes.reduce((count, t) =>
      count + (t.kind === MarkdownNodeKind.Math || t.kind === MarkdownNodeKind.MathDisplay ? 1 : 0) + formulasOf(t.children), 0);
    const wholeOf = (text: string): string => JSON.stringify(MarkdownTree.of(parser.parse(text, { [Resources.markdownMathKey]: false }), MarkdownLinkSchemes.none));
    const streamedOf = (text: string, by: number): readonly MarkdownNode[] => {
      for (let length = by; length < text.length; length += by)
        reader.read(parser, text.slice(0, length), true, MarkdownLinkSchemes.none, false);
      return reader.read(parser, text, false, MarkdownLinkSchemes.none, false);
    };
    const list = `${Array.from({ length: 5 }, (_, t) => `- kill $$ && echo $$ ${t}`).join("\n")}\n\n- $x$`;
    const filler = "lorem ".repeat(400);
    const paragraph = `${filler.slice(0, MarkdownReaderResources.markdownParagraphStep)}kill $$ && echo $$ ${filler}$x^2$ ${filler}`;
    const keep = vi.spyOn(MarkdownOpenParagraph.prototype, "keep");
    const listNodes = streamedOf(list, 1);
    const paragraphNodes = streamedOf(paragraph, 100);
    const kept = keep.mock.calls.length;

    expect([formulasOf(listNodes), JSON.stringify(listNodes) === wholeOf(list), formulasOf(paragraphNodes), JSON.stringify(paragraphNodes) === wholeOf(paragraph), kept > 0])
      .toEqual([0, true, 0, true, true]);
    expect(formulasOf(reader.read(parser, paragraph, false))).toBe(2);
  });

  it("keeps what it has parsed while math stays as it was, and reads the text again from its start when math turns off or on", () => {
    const text = "First part.\n\nSecond $x$ part.\n\nThird";
    reader.read(parser, text, false);
    const parse = vi.spyOn(parser, "parse");
    const isWholeParse = (isMath: boolean): boolean => {
      const before = parse.mock.calls.length;
      reader.read(parser, text, false, MarkdownLinkSchemes.none, isMath);
      return parse.mock.calls[before]?.[0].length === text.length;
    };

    expect([true, false, false, true].map(t => isWholeParse(t))).toEqual([false, true, false, true]);
  });

  it("reads an empty text as no blocks", () => {
    expect(reader.read(parser, String.empty, false)).toEqual([]);
  });

  it("reads Windows and old Mac line breaks as line breaks", () => {
    expect(kindsOf(reader.read(parser, "a\r\n\r\nb\r\rc", false))).toEqual([MarkdownNodeKind.Paragraph, MarkdownNodeKind.Paragraph, MarkdownNodeKind.Paragraph]);
  });

  it("holds back an unfinished tail while the text streams, and shows it once the text is complete", () => {
    expect([textOf(reader.read(parser, "Some **bo", true)), textOf(reader.read(parser, "Some **bo", false))]).toEqual(["Some", "Some **bo"]);
  });

  it("parses text as long as its limit, and leaves the rest of longer text plain, from its last line break within the limit", () => {
    const limit = MarkdownReaderResources.markdownLengthLimit;

    const exact = reader.read(parser, "a".repeat(limit), false);
    const broken = reader.read(parser, `a\n${"b".repeat(limit - 1)}`, false);
    const unbroken = reader.read(parser, "c".repeat(limit + 1), false);

    expect([kindsOf(exact), kindsOf(broken), kindsOf(unbroken)]).toEqual([
      [MarkdownNodeKind.Paragraph], [MarkdownNodeKind.Paragraph, MarkdownNodeKind.Plain], [MarkdownNodeKind.Paragraph, MarkdownNodeKind.Plain]
    ]);
    expect([textOf(broken).length, broken[1]?.text, unbroken[1]?.text]).toEqual([limit, "b".repeat(limit - 1), "c"]);
  });

  it("links the references a source finds in text, also as a streamed paragraph grows, and reads the text again for another source", () => {
    const hrefsOf = (nodes: readonly MarkdownNode[]): readonly string[] =>
      nodes.flatMap(t => [...(t.kind === MarkdownNodeKind.Link ? [t.href] : []), ...hrefsOf(t.children)]);
    const sourceOf = (repo: string): ILinkReferenceSource => ({
      find: () => null,
      findText: text => [...text.matchAll(/#(\d+)/gu)].map(t => new LinkReferenceMatch(t.index, t[0].length, `https://code.example/${repo}/issues/${t[1]}`))
    });
    const app = sourceOf("app");
    const read = (text: string, references: ILinkReferenceSource | null): readonly string[] =>
      hrefsOf(reader.read(parser, text, true, MarkdownLinkSchemes.none, true, false, references));

    expect([read("Fixed #1", app), read("Fixed #1\n\nThen #2", app), read("Fixed #1\n\nThen #2 and #3", app), read("Fixed #1\n\nThen #2 and #3", sourceOf("web")),
      read("Fixed #1\n\nThen #2 and #3", null)]).toEqual([
      ["https://code.example/app/issues/1"],
      ["https://code.example/app/issues/1", "https://code.example/app/issues/2"],
      ["https://code.example/app/issues/1", "https://code.example/app/issues/2", "https://code.example/app/issues/3"],
      ["https://code.example/web/issues/1", "https://code.example/web/issues/2", "https://code.example/web/issues/3"],
      []
    ]);
  });
});
