/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { MentionChip } from "./mention-chip.js";

export class MentionChips {
  public static carried(before: string, after: string, caret: number, chips: readonly MentionChip[]): readonly MentionChip[] {
    let tail = 0;
    const tailLimit = Math.min(before.length, after.length - caret);
    while (tail < tailLimit && before[before.length - 1 - tail] === after[after.length - 1 - tail])
      tail++;
    let start = 0;
    const startLimit = Math.min(caret, before.length - tail);
    while (start < startLimit && before[start] === after[start])
      start++;
    const end = before.length - tail;
    const shift = after.length - before.length;
    return chips.flatMap(t => t.end <= start ? [t] : t.start >= end ? [new MentionChip(t.id, t.text, t.start + shift)] : []);
  }

  public static at(chips: readonly MentionChip[], position: number): MentionChip | undefined {
    return chips.find(t => t.start < position && position < t.end);
  }

  public static endingAt(chips: readonly MentionChip[], position: number): MentionChip | undefined {
    return chips.find(t => t.end === position);
  }

  public static startingAt(chips: readonly MentionChip[], position: number): MentionChip | undefined {
    return chips.find(t => t.start === position);
  }

  public static selected(chips: readonly MentionChip[], start: number, end: number, isBackward: boolean, previous: number | null): readonly [number, number] {
    const focus = isBackward ? start : end;
    const anchor = isBackward ? end : start;
    const focusChip = MentionChips.at(chips, focus);
    let shownFocus = focus;
    if (!Object.isUndefined(focusChip)) {
      const isForward = Object.isNull(previous) || previous === focus
        ? (start === end ? focusChip.end - focus < focus - focusChip.start : !isBackward)
        : previous < focus;
      shownFocus = isForward ? focusChip.end : focusChip.start;
    }
    if (start === end)
      return [shownFocus, shownFocus];
    const anchorChip = MentionChips.at(chips, anchor);
    const shownAnchor = Object.isUndefined(anchorChip) ? anchor : isBackward ? anchorChip.end : anchorChip.start;
    return isBackward ? [shownFocus, shownAnchor] : [shownAnchor, shownFocus];
  }
}
