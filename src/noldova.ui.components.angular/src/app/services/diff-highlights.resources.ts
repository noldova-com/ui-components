/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffSide } from "../enums/diff-side.js";

export class DiffHighlightsResources {
  public static readonly diffChangeHighlightPriority: number = -1;
  public static readonly diffChangeHighlightNames: Readonly<Record<DiffSide, string>> = {
    [DiffSide.Old]: "nol-diff-removed-change",
    [DiffSide.New]: "nol-diff-added-change"
  };
}
