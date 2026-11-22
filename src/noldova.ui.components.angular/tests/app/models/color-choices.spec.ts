/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ColorSwatch } from "../../../src/app/enums/color-swatch";
import { ThemeMode } from "../../../src/app/enums/theme-mode";
import { ColorChoices } from "../../../src/app/models/color-choices";
import { DefaultTheme } from "../../../src/app/models/default-theme";
import { Theme } from "../../../src/app/models/theme";

describe("ColorChoices", () => {
  const theme = (colors: readonly (readonly [string, string])[]): Theme => new Theme("fixture.colors", "Colors", new Map(colors), new Map(colors), new Map(), new Map());

  it("lists the eight standard swatches in the chooser's order, and knows a swatch's name from any other value", () => {
    expect(ColorChoices.swatches).toEqual([ColorSwatch.Blue, ColorSwatch.Teal, ColorSwatch.Green, ColorSwatch.Amber, ColorSwatch.Orange, ColorSwatch.Red, ColorSwatch.Magenta,
      ColorSwatch.Purple]);
    expect(["teal", "purple", "Teal", "#ABC", null].map(t => ColorChoices.isSwatch(t))).toEqual([true, true, false, false, false]);
  });

  it("reads a custom color as #RRGGBB from #RGB or #RRGGBB in either case, and nothing from any other value", () => {
    expect(["#3a7d44", "#abc", "3A7D44", "#3A7D4480", "#ABCD", "teal", null].map(t => ColorChoices.readCustom(t))).toEqual(["#3A7D44", "#AABBCC", null, null, null, null, null]);
  });

  it("paints a swatch with its token, so it follows the theme, and a custom color as itself", () => {
    expect(["teal", "#abc", null, "bogus"].map(t => ColorChoices.toCss(t))).toEqual(["var(--nol-swatch-teal)", "#AABBCC", null, null]);
  });

  it("resolves a swatch to its color in each mode of the default theme, and a custom color to itself", () => {
    expect(ColorChoices.swatches.map(t => [ColorChoices.resolve(t, DefaultTheme.theme, ThemeMode.Light), ColorChoices.resolve(t, DefaultTheme.theme, ThemeMode.Dark)])).toEqual([
      ["#2F78CA", "#76A7DF"], ["#1F8582", "#2AB5B0"], ["#20882E", "#2CBB3F"], ["#977023", "#CF9A30"], ["#B75E2B", "#DB9267"], ["#D3424C", "#E48A90"], ["#CF31A5", "#E283C9"],
      ["#9358D8", "#B992E5"]
    ]);
    expect([ColorChoices.resolve("#abc", DefaultTheme.theme, ThemeMode.Dark), ColorChoices.resolve(null, DefaultTheme.theme, ThemeMode.Light)]).toEqual(["#AABBCC", null]);
  });

  it("resolves a swatch the theme leaves out to its author color, and to nothing when the theme has neither or no opaque hex color for it", () => {
    const fallback = theme([["author-2", "#102030"]]);
    const opaque = theme([["swatch-teal", "#102030ff"], ["swatch-red", "#123f"]]);
    const translucent = theme([["swatch-teal", "#10203080"], ["swatch-red", "rgb(1, 2, 3)"]]);

    expect([ColorChoices.resolve("teal", fallback, ThemeMode.Light), ColorChoices.resolve("red", fallback, ThemeMode.Light)]).toEqual(["#102030", null]);
    expect([ColorChoices.resolve("teal", opaque, ThemeMode.Light), ColorChoices.resolve("red", opaque, ThemeMode.Light)]).toEqual(["#102030", "#112233"]);
    expect([ColorChoices.resolve("teal", translucent, ThemeMode.Light), ColorChoices.resolve("red", translucent, ThemeMode.Light)]).toEqual([null, null]);
  });

  it("names the modes in which a custom color has under 3:1 contrast with the default theme's window, panel, raised or card surface", () => {
    expect(["#E4E4E4", "#303030", "#3A7D44", "#2F78CA"].map(t => ColorChoices.lowContrastModes(t, DefaultTheme.theme))).toEqual([[ThemeMode.Light], [ThemeMode.Dark], [ThemeMode.Dark], []]);
  });

  it("names both modes, light first, when the color falls short in each", () => {
    expect(ColorChoices.lowContrastModes("#808080", theme([["card", "#777777"]]))).toEqual([ThemeMode.Light, ThemeMode.Dark]);
  });

  it("names no mode for a swatch, for none, for a value that is no color, or against surfaces the theme gives no opaque hex color", () => {
    const translucent = theme([["window", "#77777780"], ["panel", "rgb(119, 119, 119)"]]);

    expect([ColorChoices.lowContrastModes("teal", DefaultTheme.theme), ColorChoices.lowContrastModes(null, DefaultTheme.theme), ColorChoices.lowContrastModes("bogus", DefaultTheme.theme),
      ColorChoices.lowContrastModes("#808080", translucent)]).toEqual([[], [], [], []]);
  });
});
