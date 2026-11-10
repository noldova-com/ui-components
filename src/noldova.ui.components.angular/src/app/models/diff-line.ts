/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import type { DiffLineKind } from "../enums/diff-line-kind.js";
import { DiffSide } from "../enums/diff-side.js";
import { DiffException } from "../exceptions/diff.exception.js";
import { Resources } from "../../resources.js";
import { DiffLineResources } from "./diff-line.resources.js";

export abstract class DiffLine {
  public readonly text: string;
  public readonly oldNumber: number | null;
  public readonly newNumber: number | null;

  protected constructor(text: string, oldNumber: number | null, newNumber: number | null) {
    for (const number of [oldNumber, newNumber])
      if (!Object.isNull(number) && (!Number.isSafeInteger(number) || number < 1))
        throw new DiffException(Resources.formatDiffLimitInvalid(DiffLineResources.diffLineNumberSubject, number));

    this.text = text;
    this.oldNumber = oldNumber;
    this.newNumber = newNumber;
  }

  public abstract get kind(): DiffLineKind;

  public abstract get side(): DiffSide;

  public hasNumberOn(side: DiffSide): boolean {
    return !Object.isNull(this.findNumberOn(side));
  }

  public numberOn(side: DiffSide): number {
    const number = this.findNumberOn(side);
    if (Object.isNull(number))
      throw new DiffException(DiffLineResources.formatDiffLineSideMissing(Resources.diffSideNames[side]));
    return number;
  }

  private findNumberOn(side: DiffSide): number | null {
    return side === DiffSide.Old ? this.oldNumber : this.newNumber;
  }
}
