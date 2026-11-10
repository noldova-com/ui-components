/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DiffHunk } from "./diff-hunk.js";

export abstract class DiffContent {
  public readonly hunks: readonly DiffHunk[];
  public readonly stateText: string | null;
  public readonly isPending: boolean;
  public readonly changedLineCount: number;
  public readonly characterCount: number;

  protected constructor(hunks: readonly DiffHunk[], stateText: string | null, isPending: boolean = false) {
    this.hunks = hunks;
    this.stateText = stateText;
    this.isPending = isPending;
    this.changedLineCount = hunks.reduce((total, t) => total + t.changedLineCount, 0);
    this.characterCount = hunks.reduce((total, t) => total + t.characterCount, 0);
  }
}
