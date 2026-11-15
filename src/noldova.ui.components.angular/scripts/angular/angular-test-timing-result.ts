/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// What the timing check found: the lines to print, and how many spec files are over the budget.
export class AngularTestTimingResult {
  public readonly lines: readonly string[];
  public readonly over: number;

  public constructor(lines: readonly string[], over: number) {
    this.lines = lines;
    this.over = over;
  }
}
