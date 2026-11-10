/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class DiffLineResources {
  public static readonly diffLineNumberSubject: string = "A line number";
  public static formatDiffLineSideMissing(side: string): string {
    return `This line has no ${side} line number.`;
  }
}
