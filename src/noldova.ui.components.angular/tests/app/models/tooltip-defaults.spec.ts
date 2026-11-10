/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { OverlaySide } from "../../../src/app/models/overlay-side";
import { TooltipDefaults } from "../../../src/app/models/tooltip-defaults";

describe("TooltipDefaults", () => {
  it("keeps its side and whether it shows only while its text is cut short, by default above and always", () => {
    const below = new TooltipDefaults(OverlaySide.below, true);

    expect([below.side, below.isTruncatedOnly]).toEqual([OverlaySide.below, true]);
    expect([TooltipDefaults.standard.side, TooltipDefaults.standard.isTruncatedOnly]).toEqual([OverlaySide.above, false]);
  });
});
