/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DiffSide } from "../enums/diff-side.js";

export class DiffChange {
  public readonly start: number;
  public readonly end: number;
  public readonly side: DiffSide;

  public constructor(start: number, end: number, side: DiffSide) {
    this.start = start;
    this.end = end;
    this.side = side;
  }
}
