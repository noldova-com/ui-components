/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Env, MarkdownIt, Token } from "markdown-it";

import "@noldova/context.core";

import { MarkdownNodeKind } from "../enums/markdown-node-kind.js";
import type { IMarkdownReference } from "../interfaces/i-markdown-reference.js";
import { MarkdownLinkSchemes } from "./markdown-link-schemes.js";
import { MarkdownOpenParagraphResources } from "./markdown-open-paragraph.resources.js";
import { MarkdownNode } from "./markdown.node.js";
import type { MarkdownTextReferences } from "./markdown-text-references.js";
import { MarkdownTree } from "./markdown-tree.js";
import { Resources } from "../../resources.js";

export class MarkdownOpenParagraph {
  private nodes: readonly MarkdownNode[] = [];
  private edge: string = String.empty;
  private chunk: readonly MarkdownNode[] = [];
  private readonly schemes: MarkdownLinkSchemes;
  private readonly isFileLinks: boolean;
  private readonly isMath: boolean;
  private readonly textReferences: MarkdownTextReferences | null;

  public readonly start: number;

  public constructor(start: number, schemes: MarkdownLinkSchemes = MarkdownLinkSchemes.none, isMath: boolean = true, isFileLinks: boolean = false,
    textReferences: MarkdownTextReferences | null = null) {
    this.start = start;
    this.textReferences = textReferences;
    this.schemes = schemes;
    this.isFileLinks = isFileLinks;
    this.isMath = isMath;
  }

  public static continues(tokens: readonly Token[]): boolean {
    const first = tokens[0];
    return !Object.isUndefined(first) && Resources.markdownOpenKinds.get(first.type) === MarkdownNodeKind.Paragraph && (first.map as [number, number])[1] === 1;
  }

  public static cutOf(text: string, from: number, to: number): number {
    for (let index = text.lastIndexOf(Resources.markdownWordGap, to); index > from; index = text.lastIndexOf(Resources.markdownWordGap, index - 1))
      if (Resources.markdownWordPattern.test(text[index - 1] as string) && MarkdownOpenParagraphResources.markdownLetterPattern.test(text[index + 1] as string))
        return index;
    return -1;
  }

  public nodeOf(block: readonly Token[]): MarkdownNode {
    const tail = (MarkdownTree.of(block, this.schemes, this.isFileLinks)[0] as MarkdownNode).children;
    return MarkdownNode.of(MarkdownNodeKind.Paragraph, [...this.nodes, ...MarkdownOpenParagraph.joined(this.edge, tail)]);
  }

  public take(parser: MarkdownIt, text: string, references: Record<string, IMarkdownReference>): boolean {
    const env: Env = { references: Object.create(references) as Record<string, IMarkdownReference>, [Resources.markdownLinkSchemesKey]: this.schemes, [Resources.markdownFileLinksKey]: this.isFileLinks, [Resources.markdownMathKey]: this.isMath,
      [Resources.markdownTextReferencesKey]: this.textReferences };
    const tokens = parser.parse(text, env);
    this.chunk = (MarkdownTree.of(tokens, this.schemes, this.isFileLinks)[0] as MarkdownNode).children;
    return MarkdownOpenParagraph.isClosed(parser, (tokens[1] as Token).content, env);
  }

  public keep(shown: MarkdownNode): void {
    const joined = MarkdownOpenParagraph.joined(this.edge, this.chunk);
    const last = joined.at(-1) as MarkdownNode;
    const isText = last.kind === MarkdownNodeKind.Text;
    this.nodes = shown.children.slice(0, this.nodes.length + joined.length - (isText ? 1 : 0));
    this.edge = (isText ? last.text : String.empty) + Resources.markdownWordGap;
  }

  private static isClosed(parser: MarkdownIt, content: string, env: Env): boolean {
    const state = new parser.inline.State(content, parser, env, []);
    parser.inline.tokenize(state);
    for (const rule of parser.inline.ruler2.getRules(String.empty))
      rule(state);
    return state.delimiters.every(t => !t.open || t.end >= 0)
      && state.tokens.every(t => t.type !== Resources.markdownTextType || !MarkdownOpenParagraphResources.markdownOpenTextPattern.test(t.content));
  }

  private static joined(edge: string, nodes: readonly MarkdownNode[]): readonly MarkdownNode[] {
    if (String.isNullOrEmpty(edge))
      return nodes;
    const first = nodes[0] as MarkdownNode;
    return first.kind === MarkdownNodeKind.Text ? [MarkdownNode.textOf(MarkdownNodeKind.Text, edge + first.text), ...nodes.slice(1)] : [MarkdownNode.textOf(MarkdownNodeKind.Text, edge), ...nodes];
  }
}
