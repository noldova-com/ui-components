/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { OverlayAlignment } from "../../../src/app/enums/overlay-alignment";
import { OverlayAnchoring } from "../../../src/app/models/overlay-anchoring";
import { OverlaySide } from "../../../src/app/models/overlay-side";

describe("OverlayAnchoring", () => {
  it("keeps its side, alignment, gap, cross offset and whether it may cross, with no cross offset and crossing allowed by default", () => {
    const tooltip = new OverlayAnchoring(OverlaySide.below, OverlayAlignment.Center, 8);
    const submenu = new OverlayAnchoring(OverlaySide.end, OverlayAlignment.Start, 0, -5);
    const list = new OverlayAnchoring(OverlaySide.below, OverlayAlignment.Start, 0, 0, false);

    expect([tooltip.side, tooltip.alignment, tooltip.gap, tooltip.crossOffset, tooltip.canCross]).toEqual([OverlaySide.below, OverlayAlignment.Center, 8, 0, true]);
    expect([submenu.side, submenu.alignment, submenu.gap, submenu.crossOffset, submenu.canCross]).toEqual([OverlaySide.end, OverlayAlignment.Start, 0, -5, true]);
    expect([list.side, list.alignment, list.gap, list.crossOffset, list.canCross]).toEqual([OverlaySide.below, OverlayAlignment.Start, 0, 0, false]);
  });
});
