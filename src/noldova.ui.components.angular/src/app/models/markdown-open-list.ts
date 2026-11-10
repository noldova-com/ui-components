/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Token } from "markdown-it";

import "@noldova/context.core";

import { MarkdownLinkSchemes } from "./markdown-link-schemes.js";
import { MarkdownOpenListResources } from "./markdown-open-list.resources.js";
import { MarkdownNode } from "./markdown.node.js";
import { MarkdownTree } from "./markdown-tree.js";
import { Resources } from "../../resources.js";

export class MarkdownOpenList {
  private readonly open: Token;
  private readonly close: Token;
  private readonly schemes: MarkdownLinkSchemes;
  private readonly isFileLinks: boolean;
  private readonly shell: MarkdownNode;
  private readonly items: (readonly Token[])[] = [];
  private readonly tight: MarkdownNode[] = [];
  private readonly loose: MarkdownNode[] = [];
  private isLoose: boolean = false;
  private isShownLoose: boolean = false;

  public constructor(list: readonly Token[], schemes: MarkdownLinkSchemes = MarkdownLinkSchemes.none, isFileLinks: boolean = false) {
    this.open = list[0] as Token;
    this.close = list.at(-1) as Token;
    this.schemes = schemes;
    this.isFileLinks = isFileLinks;
    this.shell = MarkdownTree.of([this.open, this.close], schemes, isFileLinks)[0] as MarkdownNode;
  }

  public static isOpenable(block: readonly Token[] | undefined): boolean {
    return !Object.isUndefined(block) && MarkdownOpenListResources.markdownListTypes.has((block[0] as Token).type)
      && MarkdownOpenList.itemsOf(block).length > Resources.markdownOpenItems;
  }

  public static itemsOf(list: readonly Token[]): readonly (readonly Token[])[] {
    const level = (list[0] as Token).level + 1;
    const items: (readonly Token[])[] = [];
    let start = 0;
    list.forEach((token, index) => {
      if (token.level !== level)
        return;
      if (token.nesting === 1)
        start = index;
      else
        items.push(list.slice(start, index + 1));
    });
    return items;
  }

  public nodeOf(list: readonly Token[], lines: readonly string[]): MarkdownNode {
    const items = MarkdownOpenList.itemsOf(list);
    this.isShownLoose = this.isLoose || items.some((t, i) => MarkdownOpenList.isItemLoose(t, lines, i < items.length - 1));
    MarkdownOpenList.mark(list, this.isShownLoose);
    const shown = (MarkdownTree.of(list, this.schemes, this.isFileLinks)[0] as MarkdownNode).children;
    return MarkdownNode.numbered(this.shell.kind, this.shell.value, [...this.settledOf(this.isShownLoose), ...shown]);
  }

  public keep(shown: MarkdownNode, list: readonly Token[], lines: readonly string[], count: number): void {
    const nodes = this.isShownLoose ? this.loose : this.tight;
    for (const item of MarkdownOpenList.itemsOf(list).slice(0, count)) {
      this.items.push(item);
      this.isLoose ||= MarkdownOpenList.isItemLoose(item, lines, true);
    }
    nodes.splice(0, nodes.length, ...shown.children.slice(0, this.items.length));
  }

  private settledOf(isLoose: boolean): readonly MarkdownNode[] {
    const nodes = isLoose ? this.loose : this.tight;
    for (const item of this.items.slice(nodes.length)) {
      MarkdownOpenList.mark(item, isLoose);
      nodes.push((MarkdownTree.of([this.open, ...item, this.close], this.schemes, this.isFileLinks)[0] as MarkdownNode).children[0] as MarkdownNode);
    }
    return nodes;
  }

  private static isItemLoose(item: readonly Token[], lines: readonly string[], hasNext: boolean): boolean {
    const children = item.filter(t => t.level === (item[0] as Token).level + 1 && t.nesting !== -1).map(t => t.map as [number, number]);
    const [start, end] = (item[0] as Token).map as [number, number];
    return children.slice(0, -1).some(([, last], index) => last < (children[index + 1] as [number, number])[0] || MarkdownOpenList.isBlank(lines, last - 1))
      || (hasNext && end - start > 1 && MarkdownOpenList.isBlank(lines, end - 1));
  }

  private static isBlank(lines: readonly string[], line: number): boolean {
    return MarkdownOpenListResources.markdownBlankLinePattern.test(lines[line] as string);
  }

  private static mark(tokens: readonly Token[], isLoose: boolean): void {
    const level = (tokens[0] as Token).level + (MarkdownOpenListResources.markdownListTypes.has((tokens[0] as Token).type) ? 2 : 1);
    for (const token of tokens.filter(t => t.level === level && MarkdownOpenListResources.markdownParagraphTypes.has(t.type)))
      token.hidden = !isLoose;
  }
}
