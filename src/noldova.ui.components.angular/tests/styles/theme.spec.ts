/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ViewEncapsulation } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { ThemeMode } from "../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../src/app/models/default-theme";
import { ThemePainter } from "../../src/app/services/theme-painter";
import { Resources } from "../../src/resources";
import { ForcedColorsFixture } from "../fixtures/forced-colors.fixture";

@Component({
  template: "",
  styleUrl: "../../src/styles/theme.css",
  encapsulation: ViewEncapsulation.None
})
class ThemeStylesheetHostComponent {
}

describe("theme stylesheet", () => {
  const modeAttribute = "data-nol-theme-mode";
  const lookVariables = Resources.lookTokens.map(t => Resources.formatLookVariable(t));
  let fixture: ComponentFixture<ThemeStylesheetHostComponent>;

  function painted(mode: ThemeMode): Map<string, string> {
    const element = document.createElement("div");
    new ThemePainter(DefaultTheme.theme).paint(element, DefaultTheme.theme, mode);
    return declarations(element.style);
  }

  function declarations(style: CSSStyleDeclaration): Map<string, string> {
    return new Map(Array.from(style).map(t => [t, style.getPropertyValue(t).trim()]));
  }

  function themeRules(): CSSRule[] {
    const sheet = Array.from(document.styleSheets).find(t => Array.from(t.cssRules).some(rule =>
      rule instanceof CSSStyleRule && rule.selectorText === ":root" && rule.style.getPropertyValue("--nol-window") !== ""));
    return Array.from(sheet?.cssRules ?? []);
  }

  function styleRule(rules: readonly CSSRule[], selector: string): Map<string, string> | undefined {
    const rule = rules.find(t => t instanceof CSSStyleRule && t.selectorText === selector) as CSSStyleRule | undefined;
    return rule === undefined ? undefined : declarations(rule.style);
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeStylesheetHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    document.documentElement.removeAttribute(modeAttribute);
    fixture.destroy();
  });

  it("gives the root every token the painter gives it in light mode", () => {
    expect(styleRule(themeRules(), ":root")).toEqual(painted(ThemeMode.Light));
  });

  it("gives the root the painter's dark colors when the system prefers dark and the page has not chosen light", () => {
    const media = themeRules().find(t => t instanceof CSSMediaRule) as CSSMediaRule | undefined;
    const dark = new Map([...painted(ThemeMode.Dark)].filter(([name]) => !lookVariables.includes(name)));

    expect(media?.conditionText).toBe(Resources.darkSchemeQuery);
    expect(styleRule(Array.from(media?.cssRules ?? []), `:root:not([${modeAttribute}="${ThemeMode.Light}"])`)).toEqual(dark);
    expect(styleRule(themeRules(), `:root[${modeAttribute}="${ThemeMode.Dark}"]`)).toEqual(dark);
  });

  it("switches the page's tokens with the mode its root names", () => {
    const root = getComputedStyle(document.documentElement);
    const light = painted(ThemeMode.Light).get("--nol-window");
    const dark = painted(ThemeMode.Dark).get("--nol-window");

    document.documentElement.setAttribute(modeAttribute, ThemeMode.Dark);
    expect([root.getPropertyValue("--nol-window").trim(), root.colorScheme]).toEqual([dark, Resources.darkScheme]);
    document.documentElement.setAttribute(modeAttribute, ThemeMode.Light);
    expect([root.getPropertyValue("--nol-window").trim(), root.colorScheme]).toEqual([light, Resources.lightScheme]);
  });

  for (const [mode, text, strong] of [[ThemeMode.Light, "#3B3B3B", "#3B3B3B"], [ThemeMode.Dark, "#BDBDBD", "#CCCCCC"]] as const)
    it(`draws text in ${text}, names, bold text and headings in ${strong}, and the terminal on the panel in ${mode} mode, and all of the text in CanvasText in forced colors`, async () => {
      const root = document.documentElement;
      const probes = ["--nol-text", "--nol-text-strong"].map(t => {
        const probe = document.createElement("span");
        probe.style.color = `var(${t})`;
        return document.body.appendChild(probe);
      });
      const read = (name: string): string => getComputedStyle(root).getPropertyValue(name).trim();
      root.setAttribute(modeAttribute, mode);
      try {
        const themed = [read("--nol-text"), read("--nol-text-strong"), read("--nol-terminal-background")];
        await ForcedColorsFixture.activateAsync();
        const forced = probes.map(t => getComputedStyle(t).color);

        expect(themed).toEqual([text, strong, read("--nol-panel")]);
        expect(forced).toEqual([ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("CanvasText")]);
      } finally {
        await ForcedColorsFixture.resetAsync();
        probes.forEach(t => t.remove());
      }
    });

  it("gives the terminal the system's colors in forced colors, over a painted theme on the page and in a painted scope inside it, and the theme's own otherwise", async () => {
    const root = document.documentElement;
    const scope = document.createElement("div");
    const painter = new ThemePainter(DefaultTheme.theme);
    const terminal = Resources.colorTokens.filter(t => t.variable.startsWith("--nol-terminal-")).map(t => t.variable);
    const read = (element: Element): string[] => terminal.map(t => getComputedStyle(element).getPropertyValue(t).trim());
    const system: ReadonlyMap<string, string> = new Map([
      ["--nol-terminal-background", "Canvas"], ["--nol-terminal-selection", "Highlight"], ["--nol-terminal-selection-foreground", "HighlightText"]
    ]);
    document.body.append(scope);
    painter.paint(root, DefaultTheme.theme, ThemeMode.Dark);
    painter.paint(scope, DefaultTheme.theme, ThemeMode.Light);
    try {
      const themed = [read(root), read(scope)];
      await ForcedColorsFixture.activateAsync();
      const forced = [read(root), read(scope)];
      await ForcedColorsFixture.resetAsync();

      expect(terminal).toHaveLength(42);
      expect(themed).toEqual([terminal.map(t => painted(ThemeMode.Dark).get(t)), terminal.map(t => painted(ThemeMode.Light).get(t))]);
      expect(forced).toEqual(Array.from({ length: 2 }, () => terminal.map(t => system.get(t.replace("-dark-", "-")) ?? "CanvasText")));
      expect([read(root), read(scope)]).toEqual(themed);
    } finally {
      await ForcedColorsFixture.resetAsync();
      painter.erase(root);
      scope.remove();
    }
  });

  it("gives the status dots and the warning color CanvasText in forced colors, over a painted theme on the page and in a painted scope inside it, and the theme's own colors otherwise", async () => {
    const root = document.documentElement;
    const scope = document.createElement("div");
    const painter = new ThemePainter(DefaultTheme.theme);
    const status = ["--nol-status-ok", "--nol-status-failed", "--nol-warning"];
    const read = (element: Element): string[] => status.map(t => getComputedStyle(element).getPropertyValue(t).trim());
    document.body.append(scope);
    painter.paint(root, DefaultTheme.theme, ThemeMode.Dark);
    painter.paint(scope, DefaultTheme.theme, ThemeMode.Light);
    try {
      const themed = [read(root), read(scope)];
      await ForcedColorsFixture.activateAsync();
      const forced = [read(root), read(scope)];
      await ForcedColorsFixture.resetAsync();

      expect(themed).toEqual([["#3FB950", "#F85149", "#E3A33B"], ["#1A7F37", "#CF222E", "#8A5800"]]);
      expect(forced).toEqual([["CanvasText", "CanvasText", "CanvasText"], ["CanvasText", "CanvasText", "CanvasText"]]);
      expect([read(root), read(scope)]).toEqual(themed);
    } finally {
      await ForcedColorsFixture.resetAsync();
      painter.erase(root);
      scope.remove();
    }
  });
});
