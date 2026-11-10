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
import { MarkdownFrame } from "./markdown-frame.js";
import { MarkdownLinkSchemes } from "./markdown-link-schemes.js";
import { MarkdownTreeResources } from "./markdown-tree.resources.js";
import { MarkdownNode } from "./markdown.node.js";
import { Resources } from "../../resources.js";

export class MarkdownTree {
  public static of(tokens: readonly Token[], schemes: MarkdownLinkSchemes = MarkdownLinkSchemes.none, isFileLinks: boolean = false): readonly MarkdownNode[] {
    const root = MarkdownFrame.root(schemes, isFileLinks);
    MarkdownTree.add(tokens, [root], new WeakMap());
    return root.children;
  }

  private static add(tokens: readonly Token[], frames: MarkdownFrame[], runs: WeakMap<MarkdownNode[], MarkdownNode>): void {
    for (const token of tokens) {
      const frame = frames.at(-1) as MarkdownFrame;
      if (token.type === Resources.markdownDefinitionType)
        continue;
      if (token.nesting === 1)
        frames.push(frame.childOf(token));
      else if (token.nesting === -1) {
        frames.pop();
        (frames.at(-1) as MarkdownFrame).take(frame);
      }
      else if (token.type === Resources.markdownInlineType)
        MarkdownTree.add(token.children as Token[], frames, runs);
      else
        MarkdownTree.addLeaf(token, frame.children, runs);
    }
  }

  private static addLeaf(token: Token, children: MarkdownNode[], runs: WeakMap<MarkdownNode[], MarkdownNode>): void {
    const leaf = MarkdownTree.leafOf(token);
    const previous = children.at(-1);
    const isEscape = token.type === MarkdownTreeResources.markdownSpecialTextType && token.info === MarkdownTreeResources.markdownEscapeInfo;
    const isJoinable = !isEscape && (token.type === Resources.markdownTextType || token.type === MarkdownTreeResources.markdownSpecialTextType);
    if (isJoinable && !Object.isUndefined(previous) && runs.get(children) === previous) {
      const joined = MarkdownNode.textOf(MarkdownNodeKind.Text, previous.text + leaf.text);
      children[children.length - 1] = joined;
      runs.set(children, joined);
      return;
    }
    children.push(leaf);
    if (isJoinable)
      runs.set(children, leaf);
    else
      runs.delete(children);
  }

  private static leafOf(token: Token): MarkdownNode {
    const kind = MarkdownTreeResources.markdownLeafKinds.get(token.type) ?? MarkdownNodeKind.Text;
    switch (kind) {
      case MarkdownNodeKind.Code:
        return MarkdownNode.code(token.content.replace(MarkdownTreeResources.markdownFinalLineBreakPattern, String.empty), MarkdownTree.languageOf(token.info), token.meta?.[Resources.markdownFenceOpenKey] === true);
      case MarkdownNodeKind.SoftBreak:
        return MarkdownNode.textOf(kind, Resources.markdownLineBreak);
      case MarkdownNodeKind.HardBreak:
      case MarkdownNodeKind.Rule:
        return MarkdownNode.of(kind, []);
      case MarkdownNodeKind.Image:
        return MarkdownNode.image(String(token.attrGet(MarkdownTreeResources.markdownSourceAttribute)), MarkdownTree.plainOf(token.children as Token[]),
          token.attrGet(MarkdownTreeResources.markdownTitleAttribute)?.toString() ?? null);
      case MarkdownNodeKind.Math:
      case MarkdownNodeKind.MathDisplay:
        return MarkdownNode.math(kind, token.info, token.markup.length);
      default:
        return MarkdownNode.textOf(kind, token.content);
    }
  }

  private static languageOf(info: string): string | null {
    const language = info.trim().split(MarkdownTreeResources.markdownSpacePattern)[0] as string;
    return String.isNullOrEmpty(language) ? null : language;
  }

  private static plainOf(tokens: readonly Token[]): string {
    return tokens.map(t => MarkdownTreeResources.markdownBreakTypes.has(t.type) ? Resources.markdownWordGap : Object.isNull(t.children) ? t.content : MarkdownTree.plainOf(t.children))
      .join(String.empty);
  }
}
