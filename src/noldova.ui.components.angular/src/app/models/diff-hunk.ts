/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { DiffSide } from "../enums/diff-side.js";
import { DiffException } from "../exceptions/diff.exception.js";
import { Resources } from "../../resources.js";
import { DiffHunkResources } from "./diff-hunk.resources.js";
import type { DiffLine } from "./diff-line.js";

export class DiffHunk {
  public readonly id: string;
  public readonly oldStart: number;
  public readonly oldLength: number;
  public readonly newStart: number;
  public readonly newLength: number;
  public readonly lines: readonly DiffLine[];
  public readonly section: string | null;
  public readonly changedLineCount: number;
  public readonly characterCount: number;

  public constructor(id: string, oldStart: number, oldLength: number, newStart: number, newLength: number, lines: readonly DiffLine[], section: string | null = null) {
    if (String.isNullOrWhitespace(id))
      throw new DiffException(Resources.formatDiffTextEmpty(DiffHunkResources.diffHunkIdSubject));
    for (const [subject, value] of [[DiffHunkResources.diffHunkStartSubject, oldStart], [DiffHunkResources.diffHunkLengthSubject, oldLength], [DiffHunkResources.diffHunkStartSubject, newStart], [DiffHunkResources.diffHunkLengthSubject, newLength]] as const)
      if (!Number.isSafeInteger(value) || value < 0)
        throw new DiffException(Resources.formatDiffCountInvalid(subject, value));
    DiffHunk.checkNumbering(id, DiffSide.Old, oldStart, oldLength, lines.flatMap(t => Object.isNull(t.oldNumber) ? [] : [t.oldNumber]));
    DiffHunk.checkNumbering(id, DiffSide.New, newStart, newLength, lines.flatMap(t => Object.isNull(t.newNumber) ? [] : [t.newNumber]));

    this.id = id;
    this.oldStart = oldStart;
    this.oldLength = oldLength;
    this.newStart = newStart;
    this.newLength = newLength;
    this.lines = lines;
    this.section = section;
    this.changedLineCount = lines.filter(t => Object.isNull(t.oldNumber) || Object.isNull(t.newNumber)).length;
    this.characterCount = lines.reduce((total, t) => total + t.text.length, 0);
  }

  private static checkNumbering(id: string, side: DiffSide, start: number, length: number, numbers: readonly number[]): void {
    if (numbers.length !== length || numbers.some((t, index) => t !== start + index))
      throw new DiffException(Resources.formatDiffHunkNumbering(id, Resources.diffSideNames[side], start, length));
  }
}
