/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DiffSide } from "../enums/diff-side.js";

export class DiffLineReference {
  public readonly fileId: string;
  public readonly line: number;
  public readonly side: DiffSide;

  public constructor(fileId: string, line: number, side: DiffSide) {
    this.fileId = fileId;
    this.line = line;
    this.side = side;
  }
}
