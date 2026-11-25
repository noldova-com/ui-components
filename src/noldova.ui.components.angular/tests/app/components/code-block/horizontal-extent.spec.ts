/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { HorizontalExtent } from "../../../../src/app/components/code-block/horizontal-extent";

describe("HorizontalExtent", () => {
  it("keeps its left and right edges, and gives its width as the distance between them", () => {
    const extent = new HorizontalExtent(12.5, 40);

    expect([extent.left, extent.right, extent.width]).toEqual([12.5, 40, 27.5]);
  });

  it("gives no width when its edges meet", () => {
    expect(new HorizontalExtent(8, 8).width).toBe(0);
  });
});
