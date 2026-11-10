/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { onTestFinished, vi } from "vitest";

import { ThemeMode } from "../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../src/app/models/default-theme";
import { FixtureTheme } from "../../../src/testing/models/fixture-theme";
import { AppearanceFixture } from "../../../src/testing/services/appearance-fixture";
import { PointerFixture } from "../../../src/testing/services/pointer-fixture";

describe("AppearanceFixture", () => {
  afterEach(() => AppearanceFixture.reset());

  it("paints the document's root with a theme in a mode and a panel size, and reset removes it with the tab shape", () => {
    const root = document.documentElement;

    AppearanceFixture.apply(FixtureTheme.theme, ThemeMode.Dark, 16);
    const painted = getComputedStyle(root).getPropertyValue("--nol-panel");
    root.setAttribute("data-nol-tab-shape", "pill");
    AppearanceFixture.reset();

    expect(painted.toUpperCase()).toBe("#2002A0");
    expect([root.style.length, root.hasAttribute("data-nol-tab-shape")]).toEqual([0, false]);
  });

  it("converts rem into pixels at a panel size, 13 by default", () => {
    expect([AppearanceFixture.toPixels(1), AppearanceFixture.toPixels(1.5, 13), AppearanceFixture.toPixels(1, 26)]).toEqual([16, 24, 32]);
  });

  it("reads a theme's color as the browser computes it, and refuses a color or look the theme lacks", () => {
    const missing = FixtureTheme.create(new Map());

    expect(AppearanceFixture.readColor(FixtureTheme.theme, ThemeMode.Light, "panel")).toBe("rgb(160, 2, 16)");
    expect(() => AppearanceFixture.readColor(FixtureTheme.theme, ThemeMode.Light, "missing")).toThrow(new Error("The theme fixture.contrast has no missing color."));
    expect(() => AppearanceFixture.expectLook("0px", missing, "radius-small", "border-top-left-radius", "border-radius"))
      .toThrow(new Error("The theme fixture.contrast has no radius-small value."));
  });

  it("computes the contrast of two colors from 1 to 21 in either order, reading a color without channels as black", () => {
    expect(AppearanceFixture.contrast("rgb(0, 0, 0)", "rgb(255, 255, 255)")).toBeCloseTo(21, 5);
    expect(AppearanceFixture.contrast("rgb(255, 255, 255)", "rgb(0, 0, 0)")).toBeCloseTo(21, 5);
    expect(AppearanceFixture.contrast("rgb(10, 20, 30)", "rgb(10, 20, 30)")).toBe(1);
    expect(AppearanceFixture.contrast("none", "rgb(0, 0, 0)")).toBe(1);
  });

  it("parks the pointer on a shown element in the top left corner, and removes it when the pointer cannot move onto it", async () => {
    const park = await AppearanceFixture.parkPointerAsync();
    const box = park.getBoundingClientRect();

    expect([park.matches(":popover-open"), park.matches(":hover"), box.left, box.top, box.width]).toEqual([true, true, 0, 0, 4]);
    park.remove();

    const failure = new Error("The pointer did not move.");
    const hoverAsync = vi.spyOn(PointerFixture, "hoverAsync").mockRejectedValueOnce(failure);
    onTestFinished(() => hoverAsync.mockRestore());
    const before = document.body.childElementCount;

    await expect(AppearanceFixture.parkPointerAsync()).rejects.toBe(failure);
    expect(document.body.childElementCount).toBe(before);
  });

  it("names both modes and both themes", () => {
    expect(AppearanceFixture.modes).toEqual([ThemeMode.Light, ThemeMode.Dark]);
    expect(AppearanceFixture.themes).toEqual([DefaultTheme.theme, FixtureTheme.theme]);
  });
});
