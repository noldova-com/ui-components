/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LayoutSettleFixture } from "./layout-settle.fixture";

describe("LayoutSettleFixture", () => {
  it("passes once a pass leaves the shape as it was, running a pass for each change before it", async () => {
    const shapes = ["a", "b", "c", "c"];
    let read = 0;
    let passes = 0;

    await LayoutSettleFixture.settledAsync("the shape", () => shapes[Math.min(read++, shapes.length - 1)] ?? "", () => {
      passes++;
      return Promise.resolve();
    });

    expect([passes, read]).toEqual([3, 4]);
  });
});
