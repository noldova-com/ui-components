/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { PlacedBoxes } from "../../../src/app/models/placed-boxes";

describe("PlacedBoxes", () => {
  it("keeps the origin's box and the pane's", () => {
    const origin = new DOMRectReadOnly(10, 20, 30, 40);
    const pane = new DOMRectReadOnly(10, 64, 200, 120);
    const boxes = new PlacedBoxes(origin, pane);

    expect([boxes.origin, boxes.pane]).toEqual([origin, pane]);
  });
});
