/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { Resources } from "../../resources.js";
import { MentionCodeSpanResources } from "./mention-code-span.resources.js";

export class MentionCodeSpan {
  public readonly start: number;
  public readonly end: number;
  public readonly delimiter: number;

  private constructor(start: number, end: number, delimiter: number) {
    this.start = start;
    this.end = end;
    this.delimiter = delimiter;
  }

  public static find(text: string): readonly MentionCodeSpan[] {
    const spans: MentionCodeSpan[] = [];
    const fence = new RegExp(MentionCodeSpanResources.mentionFencePattern.source, MentionCodeSpanResources.mentionFencePattern.flags);
    for (let index = 0; index < text.length;) {
      const isLineStart = index === 0 || text[index - 1] === MentionCodeSpanResources.mentionLineBreak;
      fence.lastIndex = index;
      const opening = isLineStart ? fence.exec(text) : null;
      if (!Object.isNull(opening)) {
        index = MentionCodeSpan.afterFence(text, index, opening[1] as string);
        continue;
      }
      const character = text[index];
      if (character === Resources.mentionEscape) {
        index += 2;
        continue;
      }
      if (character !== Resources.mentionBacktick) {
        index++;
        continue;
      }
      let end = index;
      while (text[end] === Resources.mentionBacktick)
        end++;
      const close = MentionCodeSpan.closing(text, end, end - index);
      if (close >= 0)
        spans.push(new MentionCodeSpan(index, close + end - index, end - index));
      index = close >= 0 ? close + end - index : end;
    }
    return spans;
  }

  private static closing(text: string, from: number, length: number): number {
    const paragraphEnd = text.indexOf(MentionCodeSpanResources.mentionParagraphBreak, from);
    const limit = paragraphEnd < 0 ? text.length : paragraphEnd;
    for (let index = text.indexOf(Resources.mentionBacktick, from); index >= 0 && index < limit;) {
      let end = index;
      while (text[end] === Resources.mentionBacktick)
        end++;
      if (end - index === length)
        return index;
      index = text.indexOf(Resources.mentionBacktick, end);
    }
    return -1;
  }

  private static afterFence(text: string, start: number, marker: string): number {
    const closing = new RegExp(MentionCodeSpanResources.formatMentionFenceClosing(marker), MentionCodeSpanResources.mentionFenceClosingFlags);
    const lineEnd = text.indexOf(MentionCodeSpanResources.mentionLineBreak, start);
    if (lineEnd < 0)
      return text.length;
    closing.lastIndex = lineEnd + 1;
    const close = closing.exec(text);
    return Object.isNull(close) ? text.length : close.index + close[0].length;
  }
}
