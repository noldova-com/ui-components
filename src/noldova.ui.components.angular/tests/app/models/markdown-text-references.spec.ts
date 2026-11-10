/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { MarkdownIt } from "markdown-it";

import { MarkdownNodeKind } from "../../../src/app/enums/markdown-node-kind";
import type { ILinkReferenceSource } from "../../../src/app/interfaces/i-link-reference-source";
import type { LinkReference } from "../../../src/app/models/link-reference";
import { LinkReferenceMatch } from "../../../src/app/models/link-reference-match";
import type { MarkdownNode } from "../../../src/app/models/markdown.node";
import { MarkdownTextReferences } from "../../../src/app/models/markdown-text-references";
import { MarkdownTree } from "../../../src/app/models/markdown-tree";
import { MarkdownParser } from "../../../src/app/services/markdown.parser";
import { Resources } from "../../../src/resources";

class TestTextReferences implements ILinkReferenceSource {
  public readonly asked: string[] = [];

  public find(): Signal<LinkReference | null> | null {
    return null;
  }

  public findText(text: string): readonly LinkReferenceMatch[] {
    this.asked.push(text);
    return [...text.matchAll(/(?:([\w.-]+\/[\w.-]+))?#(\d+)/gu)]
      .map(t => new LinkReferenceMatch(t.index, t[0].length, `https://code.example/${t[1] ?? "example/app"}/issues/${t[2]}`));
  }
}

class FixedTextReferences implements ILinkReferenceSource {
  private readonly matches: readonly LinkReferenceMatch[];

  public constructor(matches: readonly LinkReferenceMatch[]) {
    this.matches = matches;
  }

  public find(): Signal<LinkReference | null> | null {
    return null;
  }

  public findText(): readonly LinkReferenceMatch[] {
    return this.matches;
  }
}

describe("MarkdownTextReferences", () => {
  let parser: MarkdownIt;

  beforeEach(async () => {
    parser = await TestBed.inject(MarkdownParser).parserAsync() as MarkdownIt;
  });

  const shapeOf = (node: MarkdownNode): unknown[] =>
    [node.kind, ...[node.text, node.href].filter(t => t !== String.empty), ...node.children.map(shapeOf)];
  const treeOf = (source: string, references: ILinkReferenceSource | null): readonly unknown[] =>
    MarkdownTree.of(parser.parse(source, { [Resources.markdownTextReferencesKey]: MarkdownTextReferences.of(references) })).map(shapeOf);

  it("makes a link of each reference the source finds in a paragraph's text, with the matched text as its text, asking once for the paragraph", () => {
    const references = new TestTextReferences();

    expect(treeOf("See example/notes#1761 and #12, not #.", references)).toEqual([
      [MarkdownNodeKind.Paragraph,
        [MarkdownNodeKind.Text, "See "], [MarkdownNodeKind.Link, "https://code.example/example/notes/issues/1761", [MarkdownNodeKind.Text, "example/notes#1761"]],
        [MarkdownNodeKind.Text, " and "], [MarkdownNodeKind.Link, "https://code.example/example/app/issues/12", [MarkdownNodeKind.Text, "#12"]],
        [MarkdownNodeKind.Text, ", not #."]]
    ]);
    expect(references.asked).toEqual(["See example/notes#1761 and #12, not #."]);
  });

  it("finds references inside emphasis, headings, list items and table cells, each run of text asked about once and an empty one never", () => {
    const references = new TestTextReferences();

    const tree = treeOf("# Fix #1\n\n- **#2** done\n\n| a |\n| - |\n| #3 |", references);

    expect(JSON.stringify(tree).match(/issues\/\d/gu)).toEqual(["issues/1", "issues/2", "issues/3"]);
    expect(references.asked).toEqual(["Fix #1", "#2", " done", "a", "#3"]);
  });

  it("leaves the text of code spans, code blocks, links, autolinks, bare addresses and escapes as it is, and never asks about it", () => {
    const references = new TestTextReferences();

    const tree = treeOf("`#1` [#2](https://example.com/a) <https://example.com/b#3> https://example.com/c#4 \\#5 #6\n\n```\n#7\n```\n\n    #8", references);

    expect(JSON.stringify(tree).match(/issues\/\d/gu)).toEqual(["issues/6"]);
    expect(references.asked.join("|")).not.toMatch(/#[1-4]|#7|#8/u);
  });

  it("never asks about HTML: a tag, a comment, the text from an open tag to its closing tag, also across emphasis, or the lines of an HTML block, and asks about the text around it", () => {
    const references = new TestTextReferences();
    const source = "See #1 <b>org/repo#2</b> and <a href=\"x#3\">#4</a> <br> #5 <!-- #6 --> **<i>#7</i>** #8 <u>**#9**</u> #10 <span>#11\n\n<div>#12</div>\n\n<span>\n#13\n</span>\n\nText\n<div>#14";

    const tree = treeOf(source, references);

    expect(JSON.stringify(tree).match(/issues\/\d+/gu)).toEqual(["issues/1", "issues/5", "issues/8", "issues/10", "issues/11"]);
    expect(references.asked).toEqual(["See #1 ", " and ", " ", " #5 ", " ", " #8 ", " #10 ", "#11", "Text"]);
  });

  it("asks about the lines before an HTML block that starts inside a paragraph and after one that ends, and takes a tag with no closing tag, a stray closing tag or a tag alone on a later line as only itself", () => {
    const references = new TestTextReferences();
    const source = "Fixed in org/repo#12\n<details>\n#14\n\nPromise<void>; see org/repo#15\n\na </b> #16\n\n<!-- note\n#17\n-->\nAfter #18\n\n<!-- a -->\n<b>\n#19\n\nNote #20\n<b>\n#21";

    const tree = treeOf(source, references);

    expect(JSON.stringify(tree).match(/issues\/\d+/gu)).toEqual(["issues/12", "issues/15", "issues/16", "issues/18", "issues/20", "issues/21"]);
    expect(references.asked).toEqual(["Fixed in org/repo#12", "Promise", "; see org/repo#15", "a ", " #16", "After #18", "Note #20", "#21"]);
  });

  it("finds the line each token starts on from the source, so a code span or an image's text over two lines, or a bare email address made a link, never moves an HTML block's line", () => {
    const references = new TestTextReferences();
    const source = "See `a\nb` #22 user-1@host-1.example #31\n<div> #23\n\n![a\nb](https://example.com/x.png) #25\n<div> #26";

    const tree = treeOf(source, references);

    expect(JSON.stringify(tree).match(/issues\/\d+/gu)).toEqual(["issues/22", "issues/31", "issues/25"]);
    expect(references.asked).toEqual(["See ", " #22 ", " #31", " #25"]);
  });

  it("ignores a match that overlaps or comes before the one it follows, is empty, or doesn't fit in the text, and keeps the others", () => {
    const url = "https://code.example/a";
    const references = new FixedTextReferences([new LinkReferenceMatch(0, 2, url), new LinkReferenceMatch(1, 2, url), new LinkReferenceMatch(0, 1, url),
      new LinkReferenceMatch(3, 0, url), new LinkReferenceMatch(3, 2, url), new LinkReferenceMatch(5, 9, url), new LinkReferenceMatch(-1, 1, url)]);

    expect(treeOf("ab cd ef", references)).toEqual([
      [MarkdownNodeKind.Paragraph, [MarkdownNodeKind.Link, url, [MarkdownNodeKind.Text, "ab"]], [MarkdownNodeKind.Text, " "], [MarkdownNodeKind.Link, url, [MarkdownNodeKind.Text, "cd"]],
        [MarkdownNodeKind.Text, " ef"]]
    ]);
  });

  it("keeps a match whose address isn't one the view links as plain text", () => {
    const references = new FixedTextReferences([new LinkReferenceMatch(0, 2, "javascript:alert(1)"), new LinkReferenceMatch(3, 2, "https://code.example/b")]);

    const tree = treeOf("ab cd", references);

    expect([JSON.stringify(tree).match(/https?:[^"]+|javascript:[^"]+/gu), JSON.stringify(tree).match(/"(?:ab|cd| )"/gu)]).toEqual([["https://code.example/b"], ["\"ab\"", "\" \"", "\"cd\""]]);
  });

  it("finds nothing with no source, or a source that doesn't find references in text, and reads the text as before", () => {
    const plain: ILinkReferenceSource = { find: () => null };
    const before = MarkdownTree.of(parser.parse("See #12", {})).map(shapeOf);

    expect([MarkdownTextReferences.of(null), MarkdownTextReferences.of(plain), treeOf("See #12", null), treeOf("See #12", plain)]).toEqual([null, null, before, before]);
    expect(JSON.stringify(before)).not.toContain(MarkdownNodeKind.Link);
  });
});
