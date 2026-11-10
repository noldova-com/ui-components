/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import type { MarkdownNode } from "./markdown.node.js";
import { MarkdownMentionPart } from "./markdown-mention-part.js";
import type { MentionCandidate } from "./mention-candidate.js";
import { MentionFinder } from "./mention-finder.js";

export class MarkdownMentions {
  public static readonly none: MarkdownMentions = new MarkdownMentions([]);
  private readonly parts: WeakMap<MarkdownNode, readonly MarkdownMentionPart[]> = new WeakMap();
  private readonly ids: ReadonlyMap<string, MentionCandidate>;
  public readonly candidates: readonly MentionCandidate[];
  public readonly marksNames: boolean;

  public constructor(candidates: readonly MentionCandidate[], names: boolean = true) {
    this.candidates = candidates;
    this.marksNames = names && candidates.length > 0;
    this.ids = new Map(candidates.map(t => [t.id, t]));
  }

  public byId(id: string): MentionCandidate | null {
    return this.ids.get(id) ?? null;
  }

  public partsOf(node: MarkdownNode): readonly MarkdownMentionPart[] {
    let parts = this.parts.get(node);
    if (Object.isUndefined(parts)) {
      parts = MarkdownMentions.split(node.text, this.candidates);
      this.parts.set(node, parts);
    }
    return parts;
  }

  private static split(text: string, candidates: readonly MentionCandidate[]): readonly MarkdownMentionPart[] {
    const parts: MarkdownMentionPart[] = [];
    let offset = 0;
    for (const span of MentionFinder.findInText(text, candidates)) {
      if (span.start > offset)
        parts.push(new MarkdownMentionPart(text.slice(offset, span.start), null));
      parts.push(new MarkdownMentionPart(text.slice(span.start, span.end), span.candidate));
      offset = span.end;
    }
    if (offset < text.length)
      parts.push(new MarkdownMentionPart(text.slice(offset), null));
    return parts;
  }
}
