/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { OverlayAnchoring } from "./overlay-anchoring.js";
import { OverlayBoundsResources } from "./overlay-bounds.resources.js";
import { OverlayPlacement } from "./overlay-placement.js";
import { OverlaySide } from "./overlay-side.js";

export class OverlayBounds {
  public readonly top: number;
  public readonly right: number;
  public readonly bottom: number;
  public readonly left: number;
  public readonly isRightToLeft: boolean;

  public constructor(top: number, right: number, bottom: number, left: number, isRightToLeft: boolean = false) {
    this.top = top;
    this.right = right;
    this.bottom = bottom;
    this.left = left;
    this.isRightToLeft = isRightToLeft;
  }

  public place(anchor: DOMRect, width: number, height: number, anchoring: OverlayAnchoring): OverlayPlacement {
    const preferred = anchoring.side;
    const opposite = preferred.opposite;
    const across = preferred.isVertical ? [OverlaySide.end, OverlaySide.start] : [OverlaySide.below, OverlaySide.above];
    for (const side of [preferred, opposite, ...(anchoring.canCross ? across : [])])
      if (this.fits(side, anchor, width, height, anchoring.gap))
        return this.placeOn(side, anchor, width, height, anchoring);
    const side = this.roomOn(preferred, anchor, anchoring.gap) >= this.roomOn(opposite, anchor, anchoring.gap) ? preferred : opposite;
    return this.placeOn(side, anchor, width, height, anchoring);
  }

  private fits(side: OverlaySide, anchor: DOMRect, width: number, height: number, gap: number): boolean {
    const across = side.isVertical ? width <= this.right - this.left : height <= this.bottom - this.top;
    return across && (side.isVertical ? height : width) <= this.roomOn(side, anchor, gap);
  }

  private roomOn(side: OverlaySide, anchor: DOMRect, gap: number): number {
    if (side.isVertical)
      return side.isForward ? this.bottom - anchor.bottom - gap : anchor.top - gap - this.top;
    return this.isRightward(side) ? this.right - anchor.right - gap : anchor.left - gap - this.left;
  }

  private placeOn(side: OverlaySide, anchor: DOMRect, width: number, height: number, anchoring: OverlayAnchoring): OverlayPlacement {
    if (side.isVertical) {
      const shown = Math.min(height, Math.max(0, this.roomOn(side, anchor, anchoring.gap)));
      const [lowest, highest] = anchoring.gap < 0 ? [Math.min(this.top, anchor.top), Math.max(this.bottom, anchor.bottom)] : [this.top, this.bottom];
      const top = this.clamp(side.isForward ? anchor.bottom + anchoring.gap : anchor.top - anchoring.gap - shown, lowest, highest - shown);
      const left = this.clamp(this.alignedStart(anchor.left, anchor.width, width, anchoring, this.isRightToLeft), this.left, this.right - width);
      return new OverlayPlacement(left, top, side, shown < height ? shown : null);
    }
    const shown = Math.min(height, this.bottom - this.top);
    const [lowest, highest] = anchoring.gap < 0 ? [Math.min(this.left, anchor.left), Math.max(this.right, anchor.right)] : [this.left, this.right];
    const left = this.clamp(this.isRightward(side) ? anchor.right + anchoring.gap : anchor.left - anchoring.gap - width, lowest, highest - width);
    const top = this.clamp(this.alignedStart(anchor.top, anchor.height, shown, anchoring, false), this.top, this.bottom - shown);
    return new OverlayPlacement(left, top, side, shown < height ? shown : null);
  }

  private isRightward(side: OverlaySide): boolean {
    return side.isForward !== this.isRightToLeft;
  }

  private alignedStart(anchorStart: number, anchorSize: number, size: number, anchoring: OverlayAnchoring, isMirrored: boolean): number {
    const factor = OverlayBoundsResources.overlayAlignmentFactors[anchoring.alignment];
    const placed = isMirrored ? 1 - factor : factor;
    return anchorStart + (anchorSize - size) * placed + anchoring.crossOffset * (1 - 2 * placed);
  }

  private clamp(value: number, minimum: number, maximum: number): number {
    return Math.max(minimum, Math.min(value, maximum));
  }
}
