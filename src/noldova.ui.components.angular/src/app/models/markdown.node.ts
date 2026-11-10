/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { MarkdownNodeKind } from "../enums/markdown-node-kind.js";

export class MarkdownNode {
  public readonly kind: MarkdownNodeKind;
  public readonly children: readonly MarkdownNode[];
  public readonly text: string;
  public readonly value: number;
  public readonly href: string;
  public readonly language: string | null;
  public readonly align: string | null;
  public readonly title: string | null;

  private constructor(kind: MarkdownNodeKind, children: readonly MarkdownNode[], text: string, value: number, href: string, language: string | null, align: string | null,
    title: string | null = null) {
    this.kind = kind;
    this.children = children;
    this.text = text;
    this.value = value;
    this.href = href;
    this.language = language;
    this.align = align;
    this.title = title;
  }

  public static of(kind: MarkdownNodeKind, children: readonly MarkdownNode[]): MarkdownNode {
    return new MarkdownNode(kind, children, String.empty, 0, String.empty, null, null);
  }

  public static textOf(kind: MarkdownNodeKind, text: string): MarkdownNode {
    return new MarkdownNode(kind, [], text, 0, String.empty, null, null);
  }

  public static numbered(kind: MarkdownNodeKind, value: number, children: readonly MarkdownNode[]): MarkdownNode {
    return new MarkdownNode(kind, children, String.empty, value, String.empty, null, null);
  }

  public static code(text: string, language: string | null, isOpen: boolean = false): MarkdownNode {
    return new MarkdownNode(MarkdownNodeKind.Code, [], text, Number(isOpen), String.empty, language, null);
  }

  public static link(href: string, children: readonly MarkdownNode[]): MarkdownNode {
    return new MarkdownNode(MarkdownNodeKind.Link, children, String.empty, 0, href, null, null);
  }

  public static cell(kind: MarkdownNodeKind, align: string | null, children: readonly MarkdownNode[]): MarkdownNode {
    return new MarkdownNode(kind, children, String.empty, 0, String.empty, null, align);
  }

  public static image(source: string, alt: string, title: string | null): MarkdownNode {
    return new MarkdownNode(MarkdownNodeKind.Image, [], alt, 0, source, null, null, title);
  }

  public static math(kind: MarkdownNodeKind, source: string, delimiter: number): MarkdownNode {
    return new MarkdownNode(kind, [], source, delimiter, String.empty, null, null);
  }

  public static reuseAll(nodes: readonly MarkdownNode[], previous: readonly MarkdownNode[]): readonly MarkdownNode[] {
    const reused = nodes.map((t, i) => MarkdownNode.reuse(t, previous[i]));
    return reused.length === previous.length && reused.every((t, i) => t === previous[i]) ? previous : reused;
  }

  private static reuse(node: MarkdownNode, previous: MarkdownNode | undefined): MarkdownNode {
    if (node === previous)
      return previous;
    if (Object.isUndefined(previous) || node.kind !== previous.kind || node.text !== previous.text || node.value !== previous.value || node.href !== previous.href
      || node.language !== previous.language || node.align !== previous.align || node.title !== previous.title)
      return node;
    const children = MarkdownNode.reuseAll(node.children, previous.children);
    return children === previous.children ? previous : new MarkdownNode(node.kind, children, node.text, node.value, node.href, node.language, node.align, node.title);
  }
}
