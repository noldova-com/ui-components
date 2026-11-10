/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DiffLine } from "./diff-line.js";

export class DiffLinePair {
  public readonly oldLine: DiffLine | null;
  public readonly newLine: DiffLine | null;

  public constructor(oldLine: DiffLine | null, newLine: DiffLine | null) {
    this.oldLine = oldLine;
    this.newLine = newLine;
  }
}
