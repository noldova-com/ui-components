/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ForcedColorsFixture } from "./fixtures/forced-colors.fixture";
import { MotionFixture } from "./fixtures/motion.fixture";

await MotionFixture.reduceAsync();
await ForcedColorsFixture.activateAsync();

describe("shared page setup", () => {
  it("starts each spec file with no reduced motion and no forced colors, whatever was emulated before its tests", () => {
    expect([matchMedia("(prefers-reduced-motion: reduce)").matches, matchMedia("(forced-colors: active)").matches]).toEqual([false, false]);
  });
});
