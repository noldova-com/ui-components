/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import type { MentionCandidate } from "./mention-candidate.js";
import { MentionFinderResources } from "./mention-finder.resources.js";
import { MentionSpan } from "./mention-span.js";
import { Resources } from "../../resources.js";

export class MentionFinder {
  public static keyOf(name: string): string {
    return name.normalize(MentionFinderResources.mentionNameNormalization).replace(MentionFinderResources.mentionSpaceRunPattern, Resources.mentionWordSeparator).toLowerCase();
  }

  public static find(text: string, candidates: readonly MentionCandidate[]): readonly MentionSpan[] {
    return MentionFinder.scan(text, candidates, true);
  }

  public static findInText(text: string, candidates: readonly MentionCandidate[]): readonly MentionSpan[] {
    return MentionFinder.scan(text, candidates, false);
  }

  private static scan(text: string, candidates: readonly MentionCandidate[], isMarkdown: boolean): readonly MentionSpan[] {
    const names = new Map(candidates.map(t => [MentionFinder.keyOf(t.name), t]));
    const result: MentionSpan[] = [];
    const pattern = new RegExp(MentionFinderResources.mentionPattern.source, MentionFinderResources.mentionPattern.flags);
    for (let index = 0; index < text.length;) {
      const character = text[index];
      if (isMarkdown && character === Resources.mentionEscape) {
        index += 2;
        continue;
      }
      if (isMarkdown && (character === Resources.mentionBacktick || character === MentionFinderResources.mentionTilde)) {
        let end = index + 1;
        while (text[end] === character)
          end++;
        if (character === Resources.mentionBacktick || end - index >= MentionFinderResources.mentionFenceLength) {
          index = MentionFinder.afterCode(text, index, end);
          continue;
        }
      }
      if (character === Resources.mentionMarker) {
        pattern.lastIndex = index;
        const match = pattern.exec(text);
        if (!Object.isNull(match)) {
          const span = MentionFinder.longest(text, index, match[0], names);
          if (!Object.isNull(span))
            result.push(span);
          index = span?.end ?? index + match[0].length;
          continue;
        }
      }
      index++;
    }
    return result;
  }

  private static longest(text: string, start: number, written: string, names: ReadonlyMap<string, MentionCandidate>): MentionSpan | null {
    const ending = new RegExp(MentionFinderResources.mentionEndPattern.source, MentionFinderResources.mentionEndPattern.flags);
    for (let end = start + written.length; end > start + Resources.mentionMarker.length;) {
      const candidate = names.get(MentionFinder.keyOf(text.slice(start + Resources.mentionMarker.length, end)));
      ending.lastIndex = end;
      if (!Object.isUndefined(candidate) && ending.test(text))
        return new MentionSpan(candidate, start, end);
      end = text.lastIndexOf(Resources.mentionWordSeparator, end - 1);
    }
    return null;
  }

  private static afterCode(text: string, start: number, end: number): number {
    const delimiter = text.slice(start, end);
    let next = text.indexOf(delimiter, end);
    while (next >= 0) {
      let close = next + delimiter.length;
      while (text[close] === delimiter[0])
        close++;
      if (delimiter.length >= MentionFinderResources.mentionFenceLength || close - next === delimiter.length)
        return close;
      next = text.indexOf(delimiter, close);
    }
    return text.length;
  }
}
