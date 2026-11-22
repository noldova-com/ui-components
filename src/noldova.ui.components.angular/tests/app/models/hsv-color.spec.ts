/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { HsvColor } from "../../../src/app/models/hsv-color";

describe("HsvColor", () => {
  it("keeps its hue, saturation and brightness, and changes one part at a time into a new color", () => {
    const color = new HsvColor(129, 54, 49);
    const hued = color.withHue(200);
    const shaded = color.withShade(10, 90);

    expect([color.hue, color.saturation, color.brightness]).toEqual([129, 54, 49]);
    expect([hued.hue, hued.saturation, hued.brightness]).toEqual([200, 54, 49]);
    expect([shaded.hue, shaded.saturation, shaded.brightness]).toEqual([129, 10, 90]);
  });
});
