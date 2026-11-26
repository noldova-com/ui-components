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
import { DomResources } from "../../src/dom-resources";
import { Resources } from "../../src/resources";
import { ForcedColorsFixture } from "../fixtures/forced-colors.fixture";

@Component({
  template: "",
  styleUrl: "../../src/styles/theme.css",
  encapsulation: ViewEncapsulation.None
})
class ThemeStylesheetHostComponent {
}

class TextShades {
  public readonly mode: ThemeMode;
  public readonly text: string;
  public readonly strong: string;

  public constructor(mode: ThemeMode, text: string, strong: string) {
    this.mode = mode;
    this.text = text;
    this.strong = strong;
  }
}

describe("theme stylesheet", () => {
  const modeAttribute = "data-nol-theme-mode";
  const lookVariables = Resources.lookTokens.map(t => DomResources.formatLookVariable(t));
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
    const rule = rules.filter(t => t instanceof CSSStyleRule).find(t => t.selectorText === selector);
    return Object.isUndefined(rule) ? undefined : declarations(rule.style);
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
    const media = themeRules().filter(t => t instanceof CSSMediaRule).at(0);
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

  for (const { mode, text, strong } of [new TextShades(ThemeMode.Light, "#3B3B3B", "#3B3B3B"), new TextShades(ThemeMode.Dark, "#BDBDBD", "#CCCCCC")])
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
    const terminal = DomResources.colorTokens.filter(t => t.variable.startsWith("--nol-terminal-")).map(t => t.variable);
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

  it("gives the warning and error band fills Canvas in forced colors, over a painted theme on the page and in a painted scope inside it, and the theme's own fills otherwise", async () => {
    const root = document.documentElement;
    const scope = document.createElement("div");
    const painter = new ThemePainter(DefaultTheme.theme);
    const bands = ["--nol-warning-background", "--nol-error-background"];
    const read = (element: Element): string[] => bands.map(t => getComputedStyle(element).getPropertyValue(t).trim());
    document.body.append(scope);
    painter.paint(root, DefaultTheme.theme, ThemeMode.Dark);
    painter.paint(scope, DefaultTheme.theme, ThemeMode.Light);
    try {
      const themed = [read(root), read(scope)];
      await ForcedColorsFixture.activateAsync();
      const forced = [read(root), read(scope)];
      await ForcedColorsFixture.resetAsync();

      expect(themed).toEqual([["#E3A33B1F", "#F487711C"], ["#8A580014", "#A1260D12"]]);
      expect(forced).toEqual([["Canvas", "Canvas"], ["Canvas", "Canvas"]]);
      expect([read(root), read(scope)]).toEqual(themed);
    } finally {
      await ForcedColorsFixture.resetAsync();
      painter.erase(root);
      scope.remove();
    }
  });

  it("gives a text area the height of three lines of a text field with its padding and border, 4.25rem at the default panel size, and follows the panel size, the field's padding and the border", () => {
    const root = document.documentElement;
    const area = document.body.appendChild(document.createElement("div"));
    area.style.minHeight = "var(--nol-text-area-min-height)";
    try {
      const rem = Number.parseFloat(getComputedStyle(root).fontSize);
      const normal = area.getBoundingClientRect().height;
      root.style.setProperty("--nol-text-panel", "1.25rem");
      root.style.setProperty("--nol-field-padding", "0.5rem");
      root.style.setProperty("--nol-border-width", "2px");
      const changed = area.getBoundingClientRect().height;

      expect(normal).toBeCloseTo(4.25 * rem, 3);
      expect(changed).toBeCloseTo(3 * (1.25 + 0.3125) * rem + 2 * 0.5 * rem + 2 * 2, 3);
    } finally {
      for (const name of ["--nol-text-panel", "--nol-field-padding", "--nol-border-width"])
        root.style.removeProperty(name);
      area.remove();
    }
  });
});
