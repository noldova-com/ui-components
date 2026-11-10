/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { MarkdownIt, Token } from "markdown-it";

import "@noldova/context.core";

import { MarkdownNodeKind } from "../enums/markdown-node-kind.js";
import type { ILinkReferenceSource } from "../interfaces/i-link-reference-source.js";
import type { IMarkdownReference } from "../interfaces/i-markdown-reference.js";
import { MarkdownLinkSchemes } from "./markdown-link-schemes.js";
import { MarkdownReaderResources } from "./markdown-reader.resources.js";
import { MarkdownNode } from "./markdown.node.js";
import { MarkdownOpenList } from "./markdown-open-list.js";
import { MarkdownOpenParagraph } from "./markdown-open-paragraph.js";
import { MarkdownTail } from "./markdown-tail.js";
import { MarkdownTextReferences } from "./markdown-text-references.js";
import { MarkdownTree } from "./markdown-tree.js";
import { Resources } from "../../resources.js";

export class MarkdownReader {
  private settledText: string = String.empty;
  private settledNodes: readonly MarkdownNode[] = [];
  private shownNodes: readonly MarkdownNode[] = [];
  private settledReferences: Record<string, IMarkdownReference> = Object.create(null) as Record<string, IMarkdownReference>;
  private settledCount: number = 0;
  private knownReferences: Record<string, IMarkdownReference> = this.settledReferences;
  private knownCount: number = 0;
  private list: MarkdownOpenList | null = null;
  private paragraph: MarkdownOpenParagraph | null = null;
  private retry: number = 0;
  private refused: number = 0;
  private schemes: MarkdownLinkSchemes = MarkdownLinkSchemes.none;
  private isMath: boolean = true;
  private isFileLinks: boolean = false;
  private references: ILinkReferenceSource | null = null;
  private textReferences: MarkdownTextReferences | null = null;

  public read(parser: MarkdownIt, text: string, isStreaming: boolean, schemes: MarkdownLinkSchemes = MarkdownLinkSchemes.none, isMath: boolean = true, isFileLinks: boolean = false,
    references: ILinkReferenceSource | null = null): readonly MarkdownNode[] {
    if (!MarkdownReader.isSameSchemes(schemes, this.schemes) || isMath !== this.isMath || isFileLinks !== this.isFileLinks || references !== this.references) {
      this.forget();
      this.schemes = schemes;
      this.isMath = isMath;
      this.isFileLinks = isFileLinks;
      this.references = references;
      this.textReferences = MarkdownTextReferences.of(references);
    }
    const lines = text.replace(MarkdownReaderResources.markdownLineBreaksPattern, Resources.markdownLineBreak);
    const shown = isStreaming ? MarkdownTail.settledOf(lines, isMath) : lines;
    const end = MarkdownReader.parsedEndOf(shown);
    const nodes = this.nodesOf(parser, shown.slice(0, end));
    return end < shown.length ? [...nodes, MarkdownNode.textOf(MarkdownNodeKind.Plain, shown.slice(end))] : nodes;
  }

  private nodesOf(parser: MarkdownIt, text: string): readonly MarkdownNode[] {
    if (!text.startsWith(this.settledText))
      this.forget();
    let [tokens, references] = this.parse(parser, text);
    if ((this.settledNodes.length > 0 || !Object.isNull(this.list) || !Object.isNull(this.paragraph)) && !this.knows(references)) {
      this.forget();
      [tokens, references] = this.parse(parser, text);
    }
    if (!Object.isNull(this.paragraph) && !MarkdownOpenParagraph.continues(tokens)) {
      this.settledText = this.settledText.slice(0, this.paragraph.start);
      this.paragraph = null;
      [tokens, references] = this.parse(parser, text);
    }
    this.knownReferences = references;
    this.knownCount = this.settledCount + Object.keys(references).length;
    const previous = this.shownNodes.slice(this.settledNodes.length);
    const rest = text.slice(this.settledText.length);
    const lines = rest.split(Resources.markdownLineBreak);
    const blocks = MarkdownReader.blocksOf(tokens);
    const isOpening = Object.isNull(this.list) && MarkdownOpenList.isOpenable(blocks.at(-1));
    const listIndex = isOpening ? blocks.length - 1 : Object.isNull(this.list) ? -1 : 0;
    const count = isOpening ? listIndex : MarkdownReader.settledCountOf(blocks);
    const trees: (readonly MarkdownNode[])[] = blocks.map((t, i) => i === listIndex ? [] : MarkdownTree.of(t, this.schemes, this.isFileLinks));
    const listBlock = blocks[listIndex] as readonly Token[];
    const list = isOpening ? new MarkdownOpenList(listBlock, this.schemes, this.isFileLinks) : this.list;
    if (!Object.isNull(list))
      trees[listIndex] = [list.nodeOf(listBlock, lines)];
    if (!Object.isNull(this.paragraph))
      trees[0] = [this.paragraph.nodeOf(blocks[0] as readonly Token[])];
    const isListOpen = !Object.isNull(list) && count <= listIndex;
    const items = isListOpen && listIndex === blocks.length - 1 ? MarkdownOpenList.itemsOf(listBlock) : [];
    const kept = items.slice(0, Math.max(0, items.length - Resources.markdownOpenItems));
    const paragraph = this.paragraphOf(rest, blocks, count);
    const split = Object.isNull(paragraph) ? -1 : this.splitOf(parser, paragraph, rest, blocks.at(-1) as readonly Token[], references);
    const settled = [...blocks.slice(0, count).flat(), ...kept.flat()];
    for (const token of settled.filter(t => t.type === Resources.markdownDefinitionType))
      this.define((token.meta as { label: string }).label, references);
    const cut = kept.length > 0 ? MarkdownReader.startOf(items[kept.length] as readonly Token[]) : count > 0 ? MarkdownReader.startOf(blocks[count] as readonly Token[]) : 0;
    this.settledText = text.slice(0, this.settledText.length + (split >= 0 ? split : MarkdownReader.offsetOf(rest, cut)));
    const settledTree = trees.slice(0, count).flat();
    const nodes = MarkdownNode.reuseAll([...settledTree, ...trees.slice(count).flat()], previous);
    this.settledNodes = this.settledNodes.concat(nodes.slice(0, settledTree.length));
    this.shownNodes = this.settledNodes.concat(nodes.slice(settledTree.length));
    if (isListOpen)
      (list as MarkdownOpenList).keep(this.shownNodes[this.settledNodes.length] as MarkdownNode, listBlock, lines, kept.length);
    if (split >= 0)
      (paragraph as MarkdownOpenParagraph).keep(this.shownNodes[this.settledNodes.length] as MarkdownNode);
    this.list = isListOpen ? list : null;
    this.paragraph = split >= 0 ? paragraph : count === 0 ? this.paragraph : null;
    return this.shownNodes;
  }

  private paragraphOf(rest: string, blocks: readonly (readonly Token[])[], count: number): MarkdownOpenParagraph | null {
    const last = blocks.at(-1);
    if (!Object.isNull(this.paragraph) && blocks.length === 1)
      return this.paragraph;
    if (Object.isUndefined(last) || count < blocks.length - 1 || Resources.markdownOpenKinds.get((last[0] as Token).type) !== MarkdownNodeKind.Paragraph)
      return null;
    return new MarkdownOpenParagraph(this.settledText.length + MarkdownReader.offsetOf(rest, MarkdownReader.startOf(last)), this.schemes, this.isMath, this.isFileLinks, this.textReferences);
  }

  private splitOf(parser: MarkdownIt, paragraph: MarkdownOpenParagraph, rest: string, block: readonly Token[], references: Record<string, IMarkdownReference>): number {
    const [first, end] = MarkdownReader.mapOf(block);
    const start = MarkdownReader.offsetOf(rest, first);
    const from = Math.max(MarkdownReader.offsetOf(rest, end - 1), start + MarkdownReaderResources.markdownParagraphStep, this.retry - this.settledText.length);
    const split = MarkdownOpenParagraph.cutOf(rest, from, rest.length - MarkdownReaderResources.markdownParagraphMargin);
    if (split < 0)
      return split;
    const isTaken = paragraph.take(parser, rest.slice(start, split), references);
    this.refused = isTaken ? 0 : (this.refused + 1) % MarkdownReaderResources.markdownParagraphRetries;
    this.retry = this.settledText.length + split + (this.refused === 0 ? MarkdownReaderResources.markdownParagraphStep : 1);
    return isTaken ? split : -1;
  }

  private parse(parser: MarkdownIt, text: string): [Token[], Record<string, IMarkdownReference>] {
    const references = Object.create(this.settledReferences) as Record<string, IMarkdownReference>;
    return [parser.parse(text.slice(this.settledText.length), { references, [Resources.markdownLinkSchemesKey]: this.schemes, [Resources.markdownFileLinksKey]: this.isFileLinks, [Resources.markdownMathKey]: this.isMath,
      [Resources.markdownTextReferencesKey]: this.textReferences }), references];
  }

  private knows(references: Record<string, IMarkdownReference>): boolean {
    const added = Object.keys(references);
    return this.settledCount + added.length === this.knownCount
      && added.every(t => MarkdownReader.isSame(references[t] as IMarkdownReference, this.knownReferences[t]));
  }

  private define(label: string, references: Record<string, IMarkdownReference>): void {
    if (Object.hasOwn(this.settledReferences, label))
      return;
    this.settledReferences[label] = references[label] as IMarkdownReference;
    this.settledCount++;
  }

  private forget(): void {
    this.list = null;
    this.paragraph = null;
    this.retry = 0;
    this.refused = 0;
    this.settledText = String.empty;
    this.settledNodes = [];
    this.settledReferences = Object.create(null) as Record<string, IMarkdownReference>;
    this.settledCount = 0;
  }

  private static isSame(reference: IMarkdownReference, known: IMarkdownReference | undefined): boolean {
    return reference.href === known?.href;
  }

  private static isSameSchemes(schemes: MarkdownLinkSchemes, other: MarkdownLinkSchemes): boolean {
    return schemes.names.length === other.names.length && schemes.names.every((t, i) => t === other.names[i]);
  }

  private static parsedEndOf(text: string): number {
    if (text.length <= MarkdownReaderResources.markdownLengthLimit)
      return text.length;
    return text.lastIndexOf(Resources.markdownLineBreak, MarkdownReaderResources.markdownLengthLimit - 1) + 1 || MarkdownReaderResources.markdownLengthLimit;
  }

  private static blocksOf(tokens: readonly Token[]): readonly (readonly Token[])[] {
    const blocks: Token[][] = [];
    let start = 0;
    tokens.forEach((token, index) => {
      if (token.level === 0 && token.nesting !== 1) {
        blocks.push(tokens.slice(start, index + 1));
        start = index + 1;
      }
    });
    return blocks;
  }

  private static settledCountOf(blocks: readonly (readonly Token[])[]): number {
    const last = blocks.at(-1);
    const previous = blocks.at(-2);
    if (Object.isUndefined(last) || Object.isUndefined(previous))
      return 0;
    return MarkdownReader.mapOf(previous)[1] < MarkdownReader.startOf(last) ? blocks.length - 1 : blocks.length - 2;
  }

  private static startOf(block: readonly Token[]): number {
    return MarkdownReader.mapOf(block)[0];
  }

  private static mapOf(block: readonly Token[]): [number, number] {
    return (block[0] as Token).map as [number, number];
  }

  private static offsetOf(text: string, line: number): number {
    let offset = 0;
    for (let index = 0; index < line; index++)
      offset = text.indexOf(Resources.markdownLineBreak, offset) + 1;
    return offset;
  }
}
