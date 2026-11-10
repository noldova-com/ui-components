/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffSide } from "../enums/diff-side.js";
import type { DiffLine } from "./diff-line.js";
import { DiffLinePair } from "./diff-line-pair.js";

export class DiffLinePairs {
  private readonly pairs: DiffLinePair[] = [];
  private readonly waiting: Readonly<Record<DiffSide, DiffLine[]>> = { [DiffSide.Old]: [], [DiffSide.New]: [] };

  public static of(lines: readonly DiffLine[]): readonly DiffLinePair[] {
    const pairs = new DiffLinePairs();
    for (const line of lines)
      pairs.add(line);
    pairs.flush();
    return pairs.pairs;
  }

  private add(line: DiffLine): void {
    if (!line.hasNumberOn(DiffSide.Old) || !line.hasNumberOn(DiffSide.New)) {
      this.waiting[line.side].push(line);
      return;
    }
    this.flush();
    this.pairs.push(new DiffLinePair(line, line));
  }

  private flush(): void {
    const oldLines = this.waiting[DiffSide.Old].splice(0);
    const newLines = this.waiting[DiffSide.New].splice(0);
    for (let index = 0; index < Math.max(oldLines.length, newLines.length); index++)
      this.pairs.push(new DiffLinePair(oldLines[index] ?? null, newLines[index] ?? null));
  }
}
