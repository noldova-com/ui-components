/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffLineKind } from "../enums/diff-line-kind.js";
import { DiffSide } from "../enums/diff-side.js";
import { DiffLine } from "./diff-line.js";

export class DiffContextLine extends DiffLine {
  public constructor(oldNumber: number, newNumber: number, text: string) {
    super(text, oldNumber, newNumber);
  }

  public get kind(): DiffLineKind {
    return DiffLineKind.Context;
  }

  public get side(): DiffSide {
    return DiffSide.New;
  }
}
