/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeMode } from "../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../src/app/models/default-theme";
import { Resources } from "../../../src/resources";
import { FixtureTheme } from "../../../src/testing/models/fixture-theme";

describe("FixtureTheme", () => {
  it("is a complete theme whose colors and looks all differ from the default theme's, with the pill tab", () => {
    const theme = FixtureTheme.theme;

    expect([theme.id, theme.name, theme.readShape("tab")]).toEqual(["fixture.contrast", "Fixture", "pill"]);
    expect(theme.readColor(ThemeMode.Light, "panel")).toBe("#A00210");
    expect(theme.readColor(ThemeMode.Dark, "panel")).toBe("#2002A0");
    expect(theme.readLook("radius-small")).toBe("0.3rem");
    expect(theme.readColor(ThemeMode.Light, "panel")).not.toBe(DefaultTheme.theme.readColor(ThemeMode.Light, "panel"));
  });

  it("gives each color its own value, in light and dark, so a spec can tell any two colors apart", () => {
    const values = [ThemeMode.Light, ThemeMode.Dark].flatMap(mode => Resources.colorTokens.map(t => FixtureTheme.theme.readColor(mode, t.key)))
      .filter(t => t !== undefined).map(t => t.toUpperCase());

    expect(values.length).toBeGreaterThan(2 * 100);
    expect(values.filter((t, i) => values.indexOf(t) !== i)).toEqual([]);
  });

  it("is made again with other looks or shapes and the same colors", () => {
    const theme = FixtureTheme.create(new Map([["radius-small", "1rem"]]), new Map([["tab", "square"]]));

    expect([theme.id, theme.readLook("radius-small"), theme.readLook("radius-large"), theme.readShape("tab")]).toEqual(["fixture.contrast", "1rem", undefined, "square"]);
    expect(theme.readColor(ThemeMode.Dark, "text")).toBe(FixtureTheme.theme.readColor(ThemeMode.Dark, "text"));
  });
});
