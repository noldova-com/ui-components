/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LiveAnnouncer } from "@angular/cdk/a11y";
import { Component, type Type } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { GalleryContentComponent } from "../../src/app/components/gallery/gallery-content.component";
import { GalleryFormsComponent } from "../../src/app/components/gallery/gallery-forms.component";
import { GalleryNavigationComponent } from "../../src/app/components/gallery/gallery-navigation.component";
import { GalleryOverlaysComponent } from "../../src/app/components/gallery/gallery-overlays.component";
import { InlineCodeComponent } from "../../src/app/components/inline-code/inline-code.component";
import { MenuItemComponent } from "../../src/app/components/menu/menu-item.component";
import { MenuSeparatorComponent } from "../../src/app/components/menu/menu-separator.component";
import { MenuComponent } from "../../src/app/components/menu/menu.component";
import { ThemeMode } from "../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../src/app/models/default-theme";
import { Typography } from "../../src/app/models/typography";
import { ThemePainter } from "../../src/app/services/theme-painter";
import { TypographyPainter } from "../../src/app/services/typography-painter";
import { Resources } from "../../src/resources";
import { AppearanceFixture } from "../../src/testing/services/appearance-fixture";
import { DomFixture } from "../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../fixtures/forced-colors.fixture";
import { GalleryFixture } from "../fixtures/gallery.fixture";
import { MotionFixture } from "../fixtures/motion.fixture";
import { RowFillFixture } from "../fixtures/row-fill.fixture";

@Component({
  imports: [MenuComponent, MenuItemComponent, MenuSeparatorComponent],
  template: `
    <nol-menu>
      <div class="nol-menu-label">Move to</div>
      <button nol-menu-item label="Left dock" icon="dock_to_left"></button>
      <nol-menu-separator />
      <button nol-menu-item label="Right dock" [disabled]="true"></button>
    </nol-menu>
  `
})
class MenuHostComponent {
}

@Component({
  imports: [MenuComponent, MenuItemComponent],
  template: `
    <nol-menu>
      <button nol-menu-item label="Files"></button>
      <button nol-menu-item label="Search"></button>
    </nol-menu>
  `
})
class TextMenuHostComponent {
}

@Component({
  imports: [InlineCodeComponent],
  template: `<p>Run <code nol-inline-code>npm test</code> first.</p>`
})
class InlineCodeHostComponent {
}

describe("kit styles", () => {
  afterEach(async () => {
    await userEvent.keyboard("{Escape}");
    AppearanceFixture.reset();
  });

  async function openMenuAsync(host: typeof MenuHostComponent | typeof TextMenuHostComponent = MenuHostComponent): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(host);
    fixture.detectChanges();
    await fixture.whenStable();
    return DomFixture.one(DomFixture.host(fixture), "nol-menu");
  }

  it("load the Noldova fonts and the rounded symbols", async () => {
    const sans = await document.fonts.load("400 13px \"Noldova Sans\"");
    const sansItalic = await document.fonts.load("italic 600 13px \"Noldova Sans\"");
    const mono = await document.fonts.load("400 13px \"Noldova Mono\"");
    const symbols = await document.fonts.load("16px \"Material Symbols Rounded\"", "close");

    expect([sans.length, sansItalic.length, mono.length, symbols.length].every(t => t > 0)).toBe(true);
  });

  it("give text Noldova Sans, code Noldova Mono and the default message and code sizes before any typography is painted", async () => {
    AppearanceFixture.reset();
    const fixture = TestBed.createComponent(InlineCodeHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = getComputedStyle(document.documentElement);
    const paragraph = getComputedStyle(fixture.nativeElement.querySelector("p"));
    const code = getComputedStyle(fixture.nativeElement.querySelector("code"));

    expect([paragraph.fontFamily, code.fontFamily]).toEqual([Resources.noldovaSansFonts, Resources.noldovaMonoFonts]);
    expect([root.getPropertyValue(Resources.messageSizeVariable), root.getPropertyValue(Resources.codeSizeVariable)])
      .toEqual([`${Resources.defaultMessageSize / Resources.defaultRootSize}rem`, `${Resources.defaultCodeSize / Resources.defaultRootSize}rem`]);
  });

  it("draw the page's text with grayscale smoothing, which the kit's parts inherit and only macOS applies", async () => {
    const panel = await openMenuAsync();

    expect([document.body, panel].map(t => getComputedStyle(t).getPropertyValue("-webkit-font-smoothing"))).toEqual(["antialiased", "antialiased"]);
  });

  it("give the terminal 0.8125rem of its own, which follows the panel size as every rem size does and not the code size", () => {
    const root = document.documentElement;
    const probe = document.body.appendChild(document.createElement("span"));
    probe.style.fontSize = "var(--nol-text-terminal)";
    const size = (): number => Number.parseFloat(getComputedStyle(probe).fontSize);
    const before = [getComputedStyle(root).getPropertyValue("--nol-text-terminal"), size()];
    TypographyPainter.paint(root, new Typography(16, 13, 12));
    const painted = size();
    TypographyPainter.erase(root);
    probe.remove();

    expect(before).toEqual(["0.8125rem", 13]);
    expect(painted).toBeCloseTo(16, 3);
  });

  it("hide the live announcer's region from sight before any dialog has opened, so a long announcement neither shows nor makes the page scroll", async () => {
    const text = "A notification with a title and a text long enough to wrap onto several lines if it were laid out. ".repeat(20);
    void TestBed.inject(LiveAnnouncer).announce(text);
    await vi.waitFor(() => expect(document.querySelector(".cdk-live-announcer-element")?.textContent).toBe(text));
    const region = DomFixture.one(document, ".cdk-live-announcer-element");
    const box = region.getBoundingClientRect();

    expect([box.width, box.height, getComputedStyle(region).position, getComputedStyle(region).overflow]).toEqual([1, 1, "absolute", "hidden"]);
    expect(document.documentElement.scrollHeight).toBeLessThanOrEqual(window.innerHeight);
  });

  it("give headings a line height that cannot overlap when they wrap", () => {
    AppearanceFixture.apply();
    const area = document.createElement("div");
    area.style.cssText = "width: 160px;";
    area.innerHTML = "<h1>A very long heading that keeps going past one line</h1><h2>A second-level heading that also wraps</h2>";
    document.body.append(area);

    try {
      for (const heading of area.querySelectorAll<HTMLElement>("h1, h2")) {
        const style = getComputedStyle(heading);
        const lineHeight = parseFloat(style.lineHeight);
        expect(lineHeight).toBeGreaterThanOrEqual(parseFloat(style.fontSize) * 1.25);
        expect(heading.getBoundingClientRect().height).toBeGreaterThanOrEqual(lineHeight * 2);
      }
      const h1 = getComputedStyle(area.querySelector("h1") ?? area);
      const root = getComputedStyle(document.documentElement);
      expect(h1.fontSize).toBe(`${parseFloat(root.getPropertyValue("--nol-text-panel")) * parseFloat(root.fontSize) * 2}px`);
    }
    finally {
      area.remove();
    }
  });

  for (const theme of AppearanceFixture.themes)
    it(`give every scroll area, without a class, thin scrollbars without arrows whose thumb shows on hover while it and its content keep the text color, with the ${theme.id} theme`, async () => {
      AppearanceFixture.apply(theme, ThemeMode.Light);
      const area = document.createElement("div");
      area.style.cssText = "position: fixed; top: 0; left: 0; width: 200px; height: 120px; overflow: scroll;";
      const content = document.createElement("div");
      content.style.cssText = "width: 600px; height: 600px;";
      area.append(content);
      document.body.append(area);

      try {
        const scrollbar = getComputedStyle(area, "::-webkit-scrollbar");
        AppearanceFixture.expectLook(scrollbar.width, theme, "scrollbar-size", "width");
        AppearanceFixture.expectLook(scrollbar.height, theme, "scrollbar-size", "height");
        expect(getComputedStyle(area, "::-webkit-scrollbar-button").display).toBe("none");
        const text = AppearanceFixture.readColor(theme, ThemeMode.Light, "text");
        await AppearanceFixture.expectThumbRevealsOnHoverAsync(area);
        expect([getComputedStyle(area).transitionProperty, getComputedStyle(area).color, getComputedStyle(content).color]).toEqual(["--nol-scroll-thumb", text, text]);
      }
      finally {
        area.remove();
      }
    });

  it("give scroll areas thin scrollbars in the thumb color through the standard properties only where the browser has no WebKit scrollbar, outside forced colors", () => {
    AppearanceFixture.apply();
    const rules = (list: CSSRuleList): CSSRule[] => [...list].flatMap(t => t instanceof CSSGroupingRule ? [t, ...rules(t.cssRules)] : [t]);
    const all = [...document.styleSheets].flatMap(t => rules(t.cssRules));
    const standard = all.filter((t): t is CSSSupportsRule => t instanceof CSSSupportsRule && t.conditionText === "not selector(::-webkit-scrollbar)")
      .flatMap(t => rules(t.cssRules))
      .filter((t): t is CSSStyleRule => t instanceof CSSStyleRule && t.parentRule instanceof CSSMediaRule && t.parentRule.conditionText === "(forced-colors: none)")
      .map(t => [t.selectorText, t.style.getPropertyValue("scrollbar-width"), t.style.getPropertyValue("scrollbar-color")]);
    const area = document.body.appendChild(document.createElement("div"));
    area.style.cssText = "width: 10rem; height: 4rem; overflow: scroll";

    try {
      expect(standard).toEqual([[":where(*)", "thin", "var(--nol-scroll-thumb, transparent) transparent"]]);
      expect([CSS.supports("selector(::-webkit-scrollbar)"), getComputedStyle(area).scrollbarWidth, getComputedStyle(area).scrollbarColor]).toEqual([true, "auto", "auto"]);
    }
    finally {
      area.remove();
    }
  });

  it("fade a scroll area's thumb in over 150 ms, and show it at once when reduced motion is preferred", async () => {
    AppearanceFixture.apply();
    const area = document.body.appendChild(document.createElement("div"));
    area.style.cssText = "position: fixed; top: 0; left: 0; width: 200px; height: 120px; overflow: scroll;";
    area.appendChild(document.createElement("div")).style.cssText = "height: 600px;";
    const timing = (): string[] => [getComputedStyle(area).transitionDuration, getComputedStyle(area).transitionTimingFunction];

    try {
      const fading = timing();
      await MotionFixture.reduceAsync();
      const reduced = timing();
      await AppearanceFixture.expectThumbRevealsOnHoverAsync(area);

      expect([fading, reduced, area.getAnimations()]).toEqual([["0.15s", "linear"], ["0s", "ease"], []]);
    }
    finally {
      area.remove();
      await MotionFixture.resetAsync();
    }
  });

  it("let an element's own transition, in a cascade layer or not, replace the scroll thumb's, and turn a layered one off when reduced motion is preferred", async () => {
    const style = document.head.appendChild(document.createElement("style"));
    style.textContent = "@layer zz-app { .zz-layered { transition: opacity 300ms ease-in; } } .zz-plain { transition: opacity 200ms linear; }";
    const elements = ["zz-layered", "zz-plain", "zz-none"].map(t => Object.assign(document.body.appendChild(document.createElement("div")), { className: t }));
    const transitions = (): string[][] => elements.map(t => [getComputedStyle(t).transitionProperty, getComputedStyle(t).transitionDuration]);

    try {
      const own = transitions();
      await MotionFixture.reduceAsync();

      const [layered, , plain] = transitions();

      expect([own, layered, plain]).toEqual([[["opacity", "0.3s"], ["opacity", "0.2s"], ["--nol-scroll-thumb", "0.15s"]], ["none", "0s"], ["none", "0s"]]);
    }
    finally {
      elements.forEach(t => t.remove());
      style.remove();
      await MotionFixture.resetAsync();
    }
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`style the page and menus with the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        const body = getComputedStyle(document.body);

        expect(body.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "window"));
        expect(body.color).toBe(AppearanceFixture.readColor(theme, mode, "text"));

        const panel = await openMenuAsync();
        const style = getComputedStyle(panel);
        const item = panel.querySelector<HTMLElement>("[nol-menu-item]") ?? panel;
        const fill = getComputedStyle(item, "::before");
        const label = panel.querySelector<HTMLElement>(".nol-menu-label") ?? panel;
        const separator = getComputedStyle(panel.querySelector("nol-menu-separator") ?? panel);

        expect(style.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "menu"));
        expect(style.borderTopColor).toBe(AppearanceFixture.readColor(theme, mode, "menu-border"));
        AppearanceFixture.expectLook(style.borderTopWidth, theme, "border-width", "border-top-width");
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-large", "border-top-left-radius");
        AppearanceFixture.expectLook(style.paddingTop, theme, "menu-padding", "padding-top");
        AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(item).minHeight), RowFillFixture.heightOf("menu-item-height"));
        AppearanceFixture.expectLook(fill.height, theme, "menu-item-height", "height");
        AppearanceFixture.expectLook(fill.left, theme, "menu-item-inset", "margin-left");
        AppearanceFixture.expectLook(`${Number.parseFloat(getComputedStyle(item).paddingLeft) - Number.parseFloat(fill.left)}px`, theme, "menu-item-padding", "padding-left");
        AppearanceFixture.expectLook(fill.borderTopLeftRadius, theme, "radius-medium", "border-top-left-radius");
        AppearanceFixture.expectLook(separator.marginTop, theme, "menu-separator-spacing", "margin-top");
        AppearanceFixture.expectLook(separator.height, theme, "border-width", "border-top-width");
        const probe = document.body.appendChild(document.createElement("div"));
        probe.style.backgroundColor = "var(--nol-menu-separator)";
        const separatorColor = getComputedStyle(probe).backgroundColor;
        probe.remove();
        expect(separator.backgroundColor).toBe(separatorColor);
        expect(getComputedStyle(item).color).toBe(AppearanceFixture.readColor(theme, mode, "menu-text"));
        expect(getComputedStyle(label).color).toBe(AppearanceFixture.readColor(theme, mode, "text-muted"));
        AppearanceFixture.expectLook(getComputedStyle(label).paddingLeft, theme, "menu-label-padding", "padding-left", "padding");
        AppearanceFixture.expectLook(getComputedStyle(label).paddingTop, theme, "menu-label-padding", "padding-top", "padding");
      });

  it("keep a disabled menu item inoperable and without a pointer", async () => {
    AppearanceFixture.apply();

    const panel = await openMenuAsync();
    const disabled = panel.querySelectorAll<HTMLButtonElement>("[nol-menu-item]")[1];

    expect(disabled?.getAttribute("aria-disabled")).toBe("true");
    expect(getComputedStyle(disabled ?? panel).cursor).toBe("default");
  });

  it("line up a menu row without an icon with the rows that have one, and indent no row in a menu without icons", async () => {
    AppearanceFixture.apply();
    const starts = (panel: HTMLElement): number[] => [...panel.querySelectorAll(".nol-menu-item-label")].map(t => t.getBoundingClientRect().left);

    const [withIcon, withoutIcon] = starts(await openMenuAsync());
    const text = await openMenuAsync(TextMenuHostComponent);
    const item = text.querySelector<HTMLElement>("[nol-menu-item]") ?? text;

    expect(withoutIcon).toBe(withIcon);
    expect(starts(text)).toEqual([0, 1].map(() => item.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(item).paddingLeft)));
  });

  for (const panelSize of AppearanceFixture.panelSizes)
    it(`scale menu items with panel size ${panelSize}`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light, panelSize);

      const panel = await openMenuAsync();
      const item = panel.querySelector<HTMLElement>("[nol-menu-item]") ?? panel;

      AppearanceFixture.expectRem(getComputedStyle(item).minHeight, 1.875, panelSize);
      AppearanceFixture.expectRem(getComputedStyle(item, "::before").height, 1.625, panelSize);
      AppearanceFixture.expectRem(getComputedStyle(item).fontSize, 0.8125, panelSize);
    });
});

describe("kit styles in forced colors", () => {
  let frame: HTMLElement;

  beforeEach(async () => {
    await ForcedColorsFixture.activateAsync();
  });

  afterEach(async () => {
    await ForcedColorsFixture.resetAsync();
    AppearanceFixture.reset();
  });

  const showFrameAsync = async (section: Type<unknown>): Promise<void> => {
    GalleryFixture.standInForTheCodeHighlighter();
    GalleryFixture.standInForTheKitSections(section);
    frame = GalleryFixture.frames(await GalleryFixture.showScopeAsync())[0] as HTMLElement;
  };

  const one = (selector: string): HTMLElement => {
    const element = frame.querySelector<HTMLElement>(selector);
    if (element === null)
      throw new Error(`The Gallery shows no ${selector}.`);
    return element;
  };

  function outline(element: HTMLElement): readonly [string, string, string] {
    const styles = [getComputedStyle(element), getComputedStyle(element, "::before"), getComputedStyle(element, "::after"), ...[...element.querySelectorAll(".nol-tab-pill")].map(t => getComputedStyle(t)),
      ...element instanceof HTMLTableRowElement && element.firstElementChild !== null ? [getComputedStyle(element.firstElementChild, "::before")] : []];
    const style = styles.find(t => t.outlineStyle !== "none") ?? (styles[0] as CSSStyleDeclaration);
    return [style.outlineStyle, style.outlineColor, style.outlineWidth];
  }

  function doubled(): string {
    const probe = frame.appendChild(document.createElement("div"));
    probe.style.outline = "calc(var(--nol-border-width) * 2) solid";
    const width = getComputedStyle(probe).outlineWidth;
    probe.remove();
    return width;
  }

  const filledSections: readonly { name: string; parts: string; section: Type<unknown>; filled: readonly (readonly [string, string | null])[]; labels: readonly string[] }[] = [
    { name: "forms", parts: "checked pill and pressed icon button", section: GalleryFormsComponent, filled: [[".nol-choice-pill-selected", null], ["button[nol-icon-button][aria-pressed=\"true\"]", "::before"]], labels: [] },
    {
      name: "navigation",
      parts: "selected tab, current tree row, pressed toolbar button and badge",
      section: GalleryNavigationComponent,
      filled: [[".nol-tab.nol-tab-selected .nol-tab-pill", null], [".nol-tree-row-current", null], ["button[nol-toolbar-button][aria-pressed=\"true\"]", null], ["nol-view-badge", null]],
      labels: [".nol-tree-row-current .nol-tree-label", ".nol-tab.nol-tab-selected .nol-tab-label"]
    },
    {
      name: "overlays",
      parts: "active result and chosen guide",
      section: GalleryOverlaysComponent,
      filled: [[".nol-quick-input-option[aria-selected=\"true\"]", "::before"], [".nol-docking-guide-chosen", null]],
      labels: [".nol-quick-input-option[aria-selected=\"true\"] .nol-quick-input-detail"]
    }
  ];

  it.each(filledSections)("fills the $name section's $parts with the highlight, their text and icons in the highlighted text without the backplate the system draws behind text", async ({ section, filled, labels }) => {
    await showFrameAsync(section);
    const highlight = ForcedColorsFixture.resolve("Highlight");
    const text = ForcedColorsFixture.resolve("HighlightText");

    const shown = filled.map(([selector, part]) => [selector, getComputedStyle(one(selector), part).backgroundColor, getComputedStyle(one(selector)).color, getComputedStyle(one(selector)).forcedColorAdjust]);

    expect(shown).toEqual(filled.map(([selector]) => [selector, highlight, text, "none"]));
    expect(labels.map(t => getComputedStyle(one(t)).color)).toEqual(labels.map(() => text));
  });

  it.each([
    { name: "forms", section: GalleryFormsComponent, hovered: 14, focused: 18, selected: 1 },
    { name: "navigation", section: GalleryNavigationComponent, hovered: 6, focused: 12, selected: 1 },
    { name: "overlays", section: GalleryOverlaysComponent, hovered: 4, focused: 5, selected: 0 },
    { name: "content", section: GalleryContentComponent, hovered: 2, focused: 4, selected: 0 }
  ])("outlines every hovered control of the $name section with a dashed highlight, since the hover fill is forced away, and rings every focused one with the highlight at twice the border width, a field, a select, a checked pill and a selected tab included", async ({ section, hovered, focused, selected }) => {
    await showFrameAsync(section);
    const highlight = ForcedColorsFixture.resolve("Highlight");
    const ring = ["solid", highlight, doubled()];
    const hover = [...frame.querySelectorAll<HTMLElement>("[data-nol-state=\"Hover\"]")];
    const focus = [...frame.querySelectorAll<HTMLElement>("[data-nol-state=\"Focus\"]")];

    expect(hover.length).toBeGreaterThanOrEqual(hovered);
    expect(hover.map(t => [t.className, ...outline(t).slice(0, 2)])).toEqual(hover.map(t => [t.className, "dashed", highlight]));
    expect(focus.length).toBeGreaterThanOrEqual(focused);
    expect(focus.filter(t => t.matches(".nol-choice-pill-selected, .nol-tab-selected")).length).toBe(selected);
    expect(focus.map(t => [t.className, ...outline(t)])).toEqual(focus.map(t => [t.className, ...ring]));
  });

  it("draws progress and the spinner's arc in the highlight and the spinner's ring in the system gray, where they were drawn with fills alone", async () => {
    await showFrameAsync(GalleryFormsComponent);
    const ring = getComputedStyle(one(".nol-spinner-ring"));

    const shown = [getComputedStyle(one(".nol-progress-bar")).backgroundColor, getComputedStyle(one("nol-progress")).backgroundColor, ring.borderTopColor, ring.borderBottomColor];

    expect(shown).toEqual(["Highlight", "Canvas", "Highlight", "GrayText"].map(t => ForcedColorsFixture.resolve(t)));
  });

  it("draws the sash's bar and the drop line in the highlight and grips in the text color, where they were drawn with fills alone", async () => {
    await showFrameAsync(GalleryNavigationComponent);
    const line = document.body.appendChild(document.createElement("div"));
    line.className = "nol-drop-line";

    const shown = [getComputedStyle(one("nol-sash[data-nol-state=\"Focus\"] .nol-sash-bar")).backgroundColor, getComputedStyle(line).backgroundColor, getComputedStyle(one(".nol-sash-dot")).backgroundColor];
    line.remove();

    expect(shown).toEqual(["Highlight", "Highlight", "CanvasText"].map(t => ForcedColorsFixture.resolve(t)));
  });

  it("draws separators in the text color, where they were drawn with fills alone", async () => {
    await showFrameAsync(GalleryOverlaysComponent);

    expect(getComputedStyle(one("nol-menu-separator")).backgroundColor).toBe(ForcedColorsFixture.resolve("CanvasText"));
  });

  it("gives the terminal the system's colors over a painted theme on the page and in a painted scope inside it, from kit.css without theme.css", () => {
    const root = document.documentElement;
    const scope = document.body.appendChild(document.createElement("div"));
    const painter = new ThemePainter(DefaultTheme.theme);
    const terminal = Resources.colorTokens.filter(t => t.variable.startsWith("--nol-terminal-")).map(t => t.variable);
    const system: ReadonlyMap<string, string> = new Map([
      ["--nol-terminal-background", "Canvas"], ["--nol-terminal-selection", "Highlight"], ["--nol-terminal-selection-foreground", "HighlightText"]
    ]);
    const themeLoaded = [...document.styleSheets].some(t => [...t.cssRules].some(u =>
      u instanceof CSSStyleRule && u.selectorText === ":root" && u.style.getPropertyValue("--nol-window") !== ""));
    painter.paint(root, DefaultTheme.theme, ThemeMode.Dark);
    painter.paint(scope, DefaultTheme.theme, ThemeMode.Light);
    try {
      const shown = [root, scope].map(t => terminal.map(u => getComputedStyle(t).getPropertyValue(u).trim()));

      expect([themeLoaded, terminal.length]).toEqual([false, 42]);
      expect(shown).toEqual(Array.from({ length: 2 }, () => terminal.map(t => system.get(t.replace("-dark-", "-")) ?? "CanvasText")));
    } finally {
      painter.erase(root);
      scope.remove();
    }
  });

  it("gives the status dots and the warning color CanvasText over a painted theme on the page and in a painted scope inside it, from kit.css without theme.css", () => {
    const root = document.documentElement;
    const scope = document.body.appendChild(document.createElement("div"));
    const painter = new ThemePainter(DefaultTheme.theme);
    const status = ["--nol-status-ok", "--nol-status-failed", "--nol-warning"];
    painter.paint(root, DefaultTheme.theme, ThemeMode.Dark);
    painter.paint(scope, DefaultTheme.theme, ThemeMode.Light);
    try {
      const shown = [root, scope].map(t => status.map(u => getComputedStyle(t).getPropertyValue(u).trim()));

      expect(shown).toEqual([["CanvasText", "CanvasText", "CanvasText"], ["CanvasText", "CanvasText", "CanvasText"]]);
    } finally {
      painter.erase(root);
      scope.remove();
    }
  });

  it("gives the warning and error band fills Canvas over a painted theme on the page and in a painted scope inside it, from kit.css without theme.css", () => {
    const root = document.documentElement;
    const scope = document.body.appendChild(document.createElement("div"));
    const painter = new ThemePainter(DefaultTheme.theme);
    const bands = ["--nol-warning-background", "--nol-error-background"];
    painter.paint(root, DefaultTheme.theme, ThemeMode.Dark);
    painter.paint(scope, DefaultTheme.theme, ThemeMode.Light);
    try {
      const shown = [root, scope].map(t => bands.map(u => getComputedStyle(t).getPropertyValue(u).trim()));

      expect(shown).toEqual([["Canvas", "Canvas"], ["Canvas", "Canvas"]]);
    } finally {
      painter.erase(root);
      scope.remove();
    }
  });

  it("gives scroll areas the system's scrollbars, since the thin thumb is drawn with a shadow that forced colors drop", async () => {
    AppearanceFixture.apply();
    const area = document.body.appendChild(document.createElement("div"));
    area.style.cssText = "width: 10rem; height: 4rem; overflow: scroll";
    const forced = getComputedStyle(area, "::-webkit-scrollbar").width;
    await ForcedColorsFixture.resetAsync();
    const thin = getComputedStyle(area, "::-webkit-scrollbar").width;
    area.remove();

    AppearanceFixture.expectLook(thin, DefaultTheme.theme, "scrollbar-size", "width");
    expect(forced).not.toBe(thin);
  });
});
