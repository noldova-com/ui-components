/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { OverlaySide } from "./overlay-side.js";

export class TooltipDefaults {
  public static readonly standard: TooltipDefaults = new TooltipDefaults(OverlaySide.above, false);

  public readonly side: OverlaySide;
  public readonly isTruncatedOnly: boolean;

  public constructor(side: OverlaySide, isTruncatedOnly: boolean) {
    this.side = side;
    this.isTruncatedOnly = isTruncatedOnly;
  }
}
