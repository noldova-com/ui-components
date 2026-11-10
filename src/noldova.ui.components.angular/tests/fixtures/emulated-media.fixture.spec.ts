/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EmulatedMediaFixture } from "./emulated-media.fixture";
import { ForcedColorsFixture } from "./forced-colors.fixture";
import { MotionFixture } from "./motion.fixture";

describe("EmulatedMediaFixture", () => {
  afterEach(() => EmulatedMediaFixture.resetAsync());

  function emulated(): boolean[] {
    return [matchMedia("(prefers-reduced-motion: reduce)").matches, matchMedia("(forced-colors: active)").matches];
  }

  it("keeps reduced motion emulated when forced colors reset", async () => {
    await MotionFixture.reduceAsync();
    await ForcedColorsFixture.resetAsync();

    expect(emulated()).toEqual([true, false]);
  });

  it("keeps no reduced motion emulated when forced colors reset, on a machine that prefers reduced motion", async () => {
    await MotionFixture.resetAsync();
    await ForcedColorsFixture.resetAsync();

    expect(emulated()).toEqual([false, false]);
  });

  it("keeps forced colors emulated when motion resets", async () => {
    await ForcedColorsFixture.activateAsync();
    await MotionFixture.resetAsync();

    expect(emulated()).toEqual([false, true]);
  });

  function playwrightDefaults(): boolean[] {
    return [matchMedia("(prefers-color-scheme: light)").matches, matchMedia("(prefers-contrast: no-preference)").matches];
  }

  it("keeps Playwright's light scheme and no contrast preference through forced colors and their reset, and brings them back on reset", async () => {
    await ForcedColorsFixture.activateAsync();
    const forced = playwrightDefaults();
    await ForcedColorsFixture.resetAsync();
    const unforced = playwrightDefaults();
    await EmulatedMediaFixture.emulateAsync("prefers-color-scheme", "dark");
    await EmulatedMediaFixture.emulateAsync("prefers-contrast", "more");
    const changed = [matchMedia("(prefers-color-scheme: dark)").matches, matchMedia("(prefers-contrast: more)").matches];

    await EmulatedMediaFixture.resetAsync();

    expect([forced, unforced, changed, playwrightDefaults()]).toEqual([[true, true], [true, true], [true, true], [true, true]]);
  });

  it("returns to no reduced motion and no forced colors on reset, whatever was emulated", async () => {
    await MotionFixture.reduceAsync();
    await ForcedColorsFixture.activateAsync();
    const both = emulated();

    await EmulatedMediaFixture.resetAsync();

    expect([both, emulated()]).toEqual([[true, true], [false, false]]);
  });
});
