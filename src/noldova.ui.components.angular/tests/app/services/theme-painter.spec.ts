/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ThemeMode } from "../../../src/app/enums/theme-mode";
import { ThemeException } from "../../../src/app/exceptions/theme.exception";
import { Theme } from "../../../src/app/models/theme";
import { ThemePainter } from "../../../src/app/services/theme-painter";
import { DefaultTheme } from "../../../src/app/models/default-theme";
import { Resources } from "../../../src/resources";
import { FixtureTheme } from "../../../src/testing/models/fixture-theme";

describe("ThemePainter", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement("div");
  });

  afterEach(() => {
    element.remove();
  });

  function variable(name: string): string {
    return element.style.getPropertyValue(name);
  }

  it("paints every color, look value and shape of the chosen theme and mode at once, before any frame", () => {
    const painter = new ThemePainter(DefaultTheme.theme);

    painter.paint(element, FixtureTheme.theme, ThemeMode.Dark);

    expect(element.style.getPropertyValue("color-scheme")).toBe("dark");
    expect(variable("--nol-window")).toBe("#2001A0");
    expect(variable("--nol-removed")).toBe("#2037A0");
    expect(variable("--nol-docking-preview")).toBe("#2038A0");
    expect(variable("--nol-docking-preview-border")).toBe("#2039A0");
    expect(variable("--nol-radius-large")).toBe("0.6rem");
    expect(variable("--nol-tooltip-padding")).toBe("0.25rem 0.625rem");
    expect(element.getAttribute("data-nol-tab-shape")).toBe("pill");

    painter.paint(element, FixtureTheme.theme, ThemeMode.Light);

    expect(element.style.getPropertyValue("color-scheme")).toBe("light");
    expect(variable("--nol-window")).toBe("#A00110");
  });

  it("paints the default theme's own colors in light and dark", () => {
    const painter = new ThemePainter(DefaultTheme.theme);

    painter.paint(element, DefaultTheme.theme, ThemeMode.Light);
    expect([variable("--nol-text"), variable("--nol-error"), variable("--nol-removed")]).toEqual(["#3B3B3B", "#A1260D", "#A1260D"]);

    painter.paint(element, DefaultTheme.theme, ThemeMode.Dark);
    expect([variable("--nol-text"), variable("--nol-error"), variable("--nol-removed")]).toEqual(["#BDBDBD", "#F48771", "#F48771"]);
  });

  it("paints no color or look value of the fixture theme equal to the default theme's, in light or dark", () => {
    const painter = new ThemePainter(DefaultTheme.theme);
    const fixture = document.createElement("div");
    const names = [...Resources.colorTokens.map(t => t.variable), ...Resources.lookTokens.map(t => Resources.formatLookVariable(t))];

    for (const mode of [ThemeMode.Light, ThemeMode.Dark]) {
      painter.paint(element, DefaultTheme.theme, mode);
      painter.paint(fixture, FixtureTheme.theme, mode);

      expect(names.filter(n => fixture.style.getPropertyValue(n) === variable(n))).toEqual([]);
    }
  });

  it("completes a partial theme with its fallback keys, then with the default theme, and ignores a shape the kit does not have", () => {
    const partial = new Theme(
      "fixture.partial",
      "Partial",
      new Map([["raised", "#123456"], ["error", "#ABCDEF"]]),
      new Map(),
      new Map([["radius-small", "0.5rem"]]),
      new Map([["tab", "underline"]]));

    new ThemePainter(DefaultTheme.theme).paint(element, partial, ThemeMode.Light);

    expect(variable("--nol-raised")).toBe("#123456");
    expect(variable("--nol-dialog")).toBe("#123456");
    expect(variable("--nol-removed")).toBe("#ABCDEF");
    expect(variable("--nol-text")).toBe("#3B3B3B");
    expect(variable("--nol-radius-small")).toBe("0.5rem");
    expect(variable("--nol-radius-large")).toBe("0.5rem");
    expect(variable("--nol-radius-medium")).toBe("0.375rem");
    expect(element.getAttribute("data-nol-tab-shape")).toBe("pill");
  });

  it("builds a settings item's padding from its inline token, so the item's sides take that token in every theme and in a theme that changes only it", () => {
    const painter = new ThemePainter(DefaultTheme.theme);
    const item = document.createElement("div");
    const inlineOnly = new Theme("fixture.inline", "Inline", new Map(), new Map(), new Map([["settings-item-padding-inline", "2rem"]]), new Map());
    item.style.padding = "var(--nol-settings-item-padding)";
    element.append(item);
    document.body.append(element);
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

    function sides(theme: Theme): number[] {
      painter.paint(element, theme, ThemeMode.Light);
      const style = getComputedStyle(item);
      return [style.paddingInlineStart, style.paddingInlineEnd, style.paddingBlockStart, style.paddingBlockEnd].map(t => Number.parseFloat(t) / rem);
    }

    expect(sides(DefaultTheme.theme)).toEqual([0.875, 0.875, 0.75, 1.125]);
    expect(sides(FixtureTheme.theme)).toEqual([1.125, 1.125, 1, 1.25]);
    expect(sides(inlineOnly)).toEqual([2, 2, 0.75, 1.125]);
  });

  it("erases everything it painted and nothing else", () => {
    const painter = new ThemePainter(DefaultTheme.theme);
    element.style.setProperty("--other", "kept");
    element.setAttribute("data-other", "kept");
    painter.paint(element, FixtureTheme.theme, ThemeMode.Dark);

    painter.erase(element);

    expect([...element.style]).toEqual(["--other"]);
    expect(element.getAttributeNames()).toEqual(["data-other", "style"]);
  });

  it("refuses to paint, naming the value, when even the default theme lacks it", () => {
    const empty = new Theme("fixture.empty", "Empty", new Map(), new Map(), new Map(), new Map());
    const withoutLook = FixtureTheme.create(new Map(), new Map([["tab", "pill"]]));
    const withoutShapes = FixtureTheme.create(undefined, new Map());

    expect(() => new ThemePainter(empty).paint(element, empty, ThemeMode.Light))
      .toThrowError(new ThemeException("The theme \"fixture.empty\" has no value for \"window\"."));
    expect(() => new ThemePainter(withoutLook).paint(element, withoutLook, ThemeMode.Dark))
      .toThrowError(new ThemeException("The theme \"fixture.contrast\" has no value for \"radius-hover\"."));
    expect(() => new ThemePainter(withoutShapes).paint(element, withoutShapes, ThemeMode.Light))
      .toThrowError(new ThemeException("The theme \"fixture.contrast\" has no value for \"tab\"."));
  });
});
