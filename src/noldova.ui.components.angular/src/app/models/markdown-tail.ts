/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { Resources } from "../../resources.js";
import { MarkdownTailResources } from "./markdown-tail.resources.js";

export class MarkdownTail {
  public static settledOf(text: string, isMath: boolean = true): string {
    const end = MarkdownTail.settledEndOf(text, isMath);
    return end < text.length ? text.slice(0, end) : text;
  }

  private static settledEndOf(text: string, isMath: boolean): number {
    const lastStart = text.lastIndexOf(Resources.markdownLineBreak) + 1;
    const last = text.slice(lastStart);
    let offset = 0;
    let blockStart = 0;
    let fence: string | null = null;
    for (const line of lastStart === 0 ? [] : text.slice(0, lastStart - 1).split(Resources.markdownLineBreak)) {
      if (Object.isNull(fence)) {
        const opening = MarkdownTailResources.markdownFenceOpenPattern.exec(line);
        if (!Object.isNull(opening))
          fence = opening[1] as string;
        else if (line.trim() === String.empty)
          blockStart = offset + line.length + 1;
      }
      else if (MarkdownTail.closes(line, fence)) {
        fence = null;
        blockStart = offset + line.length + 1;
      }
      offset += line.length + 1;
    }

    if (!Object.isNull(fence))
      return MarkdownTail.isShortFence(last, fence) ? lastStart : text.length;
    if (MarkdownTailResources.markdownFenceOpenPattern.test(last))
      return lastStart;
    const hold = Math.min(MarkdownTail.tableStartOf(text, blockStart), MarkdownTailResources.markdownBlockMarkerPattern.test(last) ? lastStart : text.length,
      MarkdownTail.openPartOf(text, blockStart, isMath));
    return text.length - hold <= MarkdownTailResources.markdownHeldTailLimit ? hold : text.length;
  }

  private static openPartOf(text: string, blockStart: number, isMath: boolean): number {
    const start = Math.max(blockStart, text.length - MarkdownTailResources.markdownTailScanLimit);
    const part = isMath ? text.slice(start).replace(MarkdownTailResources.markdownMathSpanPattern, t => " ".repeat(t.length)) : text.slice(start);
    return start + Math.min(MarkdownTail.openConstructOf(part), MarkdownTail.openAutolinkOf(part.replace(MarkdownTailResources.markdownCodeSpanPattern, t => " ".repeat(t.length))));
  }

  private static tableStartOf(text: string, blockStart: number): number {
    const rows = text.slice(blockStart).split(Resources.markdownLineBreak);
    const header = rows[0] as string;
    if (!MarkdownTailResources.markdownTableRowPattern.test(header))
      return text.length;
    return rows.length > 1 && MarkdownTail.isDelimiter(rows[1] as string, MarkdownTail.cellsOf(header).length) ? text.length : blockStart;
  }

  private static closes(line: string, fence: string): boolean {
    const mark = MarkdownTailResources.markdownFenceMarkPattern.exec(line)?.[1];
    return !Object.isUndefined(mark) && mark[0] === fence[0] && mark.length >= fence.length;
  }

  private static isShortFence(line: string, fence: string): boolean {
    const mark = MarkdownTailResources.markdownFenceMarkPattern.exec(line)?.[1];
    return !Object.isUndefined(mark) && mark[0] === fence[0] && mark.length < fence.length;
  }

  private static cellsOf(row: string): readonly string[] {
    let trimmed = row.trim();
    if (trimmed.startsWith(MarkdownTailResources.markdownTableEdge))
      trimmed = trimmed.slice(1);
    if (trimmed.endsWith(MarkdownTailResources.markdownTableEdge))
      trimmed = trimmed.slice(0, -1);
    return trimmed.split(MarkdownTailResources.markdownTableEdge);
  }

  private static isDelimiter(row: string, columns: number): boolean {
    const cells = MarkdownTail.cellsOf(row);
    return cells.length >= columns && cells.every(t => MarkdownTailResources.markdownDelimiterCellPattern.test(t));
  }

  private static openConstructOf(part: string): number {
    const openers: (readonly [string, number, number])[] = [];
    const earliest = (t: number): number => Math.min(t, openers[0]?.[2] ?? t);
    let position = 0;
    while (position < part.length) {
      const character = part[position] as string;
      if (character === MarkdownTailResources.markdownEscape) {
        if (position === part.length - 1)
          return earliest(position);
        position += 2;
      }
      else if (character === Resources.markdownBacktick) {
        const length = MarkdownTail.runLengthOf(part, position);
        const close = MarkdownTail.runOf(part, length, position + length);
        if (close < 0)
          return earliest(position);
        position = close + length;
      }
      else if (MarkdownTailResources.markdownEmphasisMarks.includes(character)) {
        const length = MarkdownTail.runLengthOf(part, position);
        const start = position;
        position += length;
        if (character === MarkdownTailResources.markdownTilde && length < 2)
          continue;
        const matching = openers.findLastIndex(t => t[0] === character && t[1] === length);
        if (MarkdownTail.canClose(part, start, length, character) && matching >= 0)
          openers.length = matching;
        else if (MarkdownTail.canOpen(part, start, length, character))
          openers.push([character, length, start]);
      }
      else if (character === MarkdownTailResources.markdownLinkStart || (character === MarkdownTailResources.markdownImageStart && part[position + 1] === MarkdownTailResources.markdownLinkStart)) {
        const open = character === MarkdownTailResources.markdownLinkStart ? position : position + 1;
        if (MarkdownTail.isUnfinishedLink(part, open))
          return earliest(position);
        position = open + 1;
      }
      else if (character === MarkdownTailResources.markdownLinkEnd && part[position + 1] === MarkdownTailResources.markdownDestinationStart) {
        const close = part.indexOf(MarkdownTailResources.markdownDestinationEnd, position + 2);
        if (close < 0)
          return earliest(position);
        position = close + 1;
      }
      else
        position++;
    }
    return openers.length > 0 ? earliest(part.length) : part.length;
  }

  private static runLengthOf(part: string, position: number): number {
    let end = position;
    while (part[end] === part[position])
      end++;
    return end - position;
  }

  private static runOf(part: string, length: number, from: number): number {
    let position = part.indexOf(Resources.markdownBacktick, from);
    while (position >= 0) {
      const run = MarkdownTail.runLengthOf(part, position);
      if (run === length)
        return position;
      position = part.indexOf(Resources.markdownBacktick, position + run);
    }
    return -1;
  }

  private static canOpen(part: string, position: number, length: number, character: string): boolean {
    const after = part[position + length];
    if (Object.isUndefined(after))
      return true;
    return !Resources.markdownWhitespacePattern.test(after)
      && (character !== MarkdownTailResources.markdownUnderscore || position === 0 || !Resources.markdownWordPattern.test(part[position - 1] as string));
  }

  private static canClose(part: string, position: number, length: number, character: string): boolean {
    const before = part[position - 1];
    const after = part[position + length];
    if (Object.isUndefined(before) || Resources.markdownWhitespacePattern.test(before))
      return false;
    return character !== MarkdownTailResources.markdownUnderscore || Object.isUndefined(after) || !Resources.markdownWordPattern.test(after);
  }

  private static isUnfinishedLink(part: string, open: number): boolean {
    let depth = 0;
    for (let position = open; position < part.length; position++) {
      const character = part[position];
      if (character === MarkdownTailResources.markdownEscape)
        position++;
      else if (character === MarkdownTailResources.markdownLinkStart)
        depth++;
      else if (character === MarkdownTailResources.markdownLinkEnd && --depth === 0)
        return position === part.length - 1 || (part[position + 1] === MarkdownTailResources.markdownDestinationStart && part.indexOf(MarkdownTailResources.markdownDestinationEnd, position + 2) < 0);
    }
    return true;
  }

  private static openAutolinkOf(part: string): number {
    const start = part.lastIndexOf(MarkdownTailResources.markdownAutolinkStart);
    const isOpen = start >= 0 && !Resources.markdownWhitespacePattern.test(part.slice(start + 1, start + 2)) && !part.includes(MarkdownTailResources.markdownAutolinkEnd, start);
    return isOpen ? start : part.length;
  }
}
