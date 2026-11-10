/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Token } from "markdown-it";

import "@noldova/context.core";

import { MarkdownNodeKind } from "../enums/markdown-node-kind.js";
import { MarkdownFrameResources } from "./markdown-frame.resources.js";
import { MarkdownLink } from "./markdown-link.js";
import { MarkdownLinkSchemes } from "./markdown-link-schemes.js";
import { MarkdownNode } from "./markdown.node.js";
import { Resources } from "../../resources.js";

export class MarkdownFrame {
  public readonly children: MarkdownNode[] = [];

  private readonly token: Token | null;
  private readonly kind: MarkdownNodeKind | null;
  private readonly depth: number;
  private readonly listDepth: number;
  private readonly quoteDepth: number;
  private readonly schemes: MarkdownLinkSchemes;
  private readonly isFileLinks: boolean;

  private constructor(token: Token | null, kind: MarkdownNodeKind | null, depth: number, listDepth: number, quoteDepth: number, schemes: MarkdownLinkSchemes, isFileLinks: boolean) {
    this.token = token;
    this.kind = kind;
    this.depth = depth;
    this.listDepth = listDepth;
    this.quoteDepth = quoteDepth;
    this.schemes = schemes;
    this.isFileLinks = isFileLinks;
  }

  public static root(schemes: MarkdownLinkSchemes = MarkdownLinkSchemes.none, isFileLinks: boolean = false): MarkdownFrame {
    return new MarkdownFrame(null, null, 0, 0, 0, schemes, isFileLinks);
  }

  public childOf(token: Token): MarkdownFrame {
    const kind = this.kindOf(token);
    if (Object.isNull(kind))
      return this.lifted(token);
    if (Resources.markdownPartKinds.has(kind))
      return Object.isNull(this.kind) ? this.lifted(token) : new MarkdownFrame(token, kind, this.depth, this.listDepth, this.quoteDepth, this.schemes, this.isFileLinks);
    const depth = this.depth + 1;
    const listDepth = this.listDepth + (MarkdownFrameResources.markdownListKinds.has(kind) ? 1 : 0);
    const quoteDepth = this.quoteDepth + (kind === MarkdownNodeKind.Quote ? 1 : 0);
    if (depth > Resources.markdownNestingLimit || listDepth > Resources.markdownListDepthLimit || quoteDepth > Resources.markdownQuoteDepthLimit)
      return this.lifted(token);
    return new MarkdownFrame(token, kind, depth, listDepth, quoteDepth, this.schemes, this.isFileLinks);
  }

  public take(child: MarkdownFrame): void {
    if (!Object.isNull(child.kind)) {
      this.children.push(child.nodeOf(child.kind));
      return;
    }
    const last = this.children.at(-1);
    const first = child.children.at(0);
    if ((child.token as Token).block && !Object.isUndefined(last) && !Object.isUndefined(first)
      && Resources.markdownInlineKinds.has(last.kind) && Resources.markdownInlineKinds.has(first.kind))
      this.children.push(MarkdownNode.of(MarkdownNodeKind.HardBreak, []));
    for (const node of child.children)
      this.children.push(node);
  }

  private kindOf(token: Token): MarkdownNodeKind | null {
    const kind = Resources.markdownOpenKinds.get(token.type) ?? null;
    if (token.hidden)
      return null;
    if (kind === MarkdownNodeKind.Link && !MarkdownLink.isLink(String(token.attrGet(Resources.markdownHrefAttribute)), this.schemes, this.isFileLinks))
      return null;
    return kind;
  }

  private lifted(token: Token): MarkdownFrame {
    return new MarkdownFrame(token, null, this.depth, this.listDepth, this.quoteDepth, this.schemes, this.isFileLinks);
  }

  private nodeOf(kind: MarkdownNodeKind): MarkdownNode {
    const token = this.token as Token;
    switch (kind) {
      case MarkdownNodeKind.Heading:
        return MarkdownNode.numbered(kind, Number(token.tag.slice(1)), this.children);
      case MarkdownNodeKind.OrderedList:
        return MarkdownNode.numbered(kind, Number(token.attrGet(MarkdownFrameResources.markdownStartAttribute) ?? 1), this.children);
      case MarkdownNodeKind.ListItem:
        return MarkdownFrame.itemOf(this.children);
      case MarkdownNodeKind.Link:
        return MarkdownNode.link(String(token.attrGet(Resources.markdownHrefAttribute)), this.children);
      case MarkdownNodeKind.TableHeaderCell:
      case MarkdownNodeKind.TableCell:
        return MarkdownNode.cell(kind, MarkdownFrameResources.markdownAlignPattern.exec(String(token.attrGet(MarkdownFrameResources.markdownStyleAttribute)))?.[1] ?? null, this.children);
      default:
        return MarkdownNode.of(kind, this.children);
    }
  }

  private static itemOf(children: readonly MarkdownNode[]): MarkdownNode {
    const [first, ...blocks] = children;
    const paragraph = first?.kind === MarkdownNodeKind.Paragraph ? first : null;
    const [text, ...inline] = paragraph?.children ?? children;
    const marker = text?.kind === MarkdownNodeKind.Text ? MarkdownFrameResources.markdownTaskPattern.exec(text.text) : null;
    if (Object.isUndefined(text) || Object.isNull(marker))
      return MarkdownNode.of(MarkdownNodeKind.ListItem, children);
    const rest = text.text.slice(marker[0].length);
    const label = String.isNullOrEmpty(rest) ? inline : [MarkdownNode.textOf(MarkdownNodeKind.Text, rest), ...inline];
    const content = Object.isNull(paragraph) ? label : [MarkdownNode.of(MarkdownNodeKind.Paragraph, label), ...blocks];
    return MarkdownNode.numbered(MarkdownNodeKind.TaskItem, marker[1] === MarkdownFrameResources.markdownTaskOpen ? 0 : 1, content);
  }
}
