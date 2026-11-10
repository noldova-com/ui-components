/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { OverlayAlignment } from "../enums/overlay-alignment.js";
import type { OverlaySide } from "./overlay-side.js";

export class OverlayAnchoring {
  public readonly side: OverlaySide;
  public readonly alignment: OverlayAlignment;
  public readonly gap: number;
  public readonly crossOffset: number;
  public readonly canCross: boolean;

  public constructor(side: OverlaySide, alignment: OverlayAlignment, gap: number, crossOffset: number = 0, canCross: boolean = true) {
    this.side = side;
    this.alignment = alignment;
    this.gap = gap;
    this.crossOffset = crossOffset;
    this.canCross = canCross;
  }
}
