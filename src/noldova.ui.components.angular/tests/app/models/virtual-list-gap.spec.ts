/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { VirtualListGap } from "../../../src/app/models/virtual-list-gap";

describe("VirtualListGap", () => {
  it("keeps whether its rows failed to load, whether they start at the top of the view, and whether a read of them is slow", () => {
    const gap = new VirtualListGap(true, false, true);

    expect([gap.isFailed, gap.isAtStart, gap.isSlow]).toEqual([true, false, true]);
  });
});
