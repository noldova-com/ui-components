/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";
import { Router, provideRouter, withComponentInputBinding } from "@angular/router";
import { kitBaseStyles } from "@docs-generated/kit-base-styles.js";
import { DefaultTheme, ThemeMode } from "@noldova/ui.components.angular";
import { provideMarkdown } from "@noldova/ui.components.angular/markdown";
import type {} from "@vitest/browser-playwright";
import { cdp, userEvent } from "vitest/browser";

import { Resources as KitResources } from "../../../../../noldova.ui.components.angular/src/resources.js";
import { routes } from "../../../../src/app/app.routes.js";
import { DocsShellComponent } from "../../../../src/app/components/docs-shell/docs-shell.component.js";
import { DocsFixture } from "../../../fixtures/docs.fixture.js";

describe("TokensPageComponent", () => {
  const renderAsync = async (url: string): Promise<HTMLElement> => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding()), provideMarkdown()] });
    const fixture = TestBed.createComponent(DocsShellComponent);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    return DocsFixture.host(fixture);
  };

  const heading = (host: HTMLElement): string | undefined => host.querySelector("main h1")?.textContent?.trim();

  const cellText = (row: HTMLElement, selector: string): string => DocsFixture.one(row, selector).textContent?.trim() ?? "";

  const modeValues = (row: HTMLElement): readonly string[] => {
    const light = cellText(row, "td:nth-of-type(1)");
    return DocsFixture.one(row, "td").colSpan === 2 ? [light, light] : [light, cellText(row, "td:nth-of-type(2)")];
  };

  const shownValues = (host: HTMLElement): ReadonlyMap<string, readonly string[]> =>
    new Map(DocsFixture.all(host, "main tbody tr").map((t): [string, readonly string[]] => [cellText(t, "th"), modeValues(t)]));

  const shownNames = (host: HTMLElement): readonly string[] => DocsFixture.all(host, "main tbody th").map(t => t.textContent?.trim() ?? "");

  const lookVariables = (): readonly string[] => KitResources.lookTokens.map(t => KitResources.formatLookVariable(t));

  const rulesOf = (sheet: CSSStyleSheet): readonly CSSRule[] =>
    [...sheet.cssRules].flatMap(t => t instanceof CSSImportRule && t.styleSheet !== null ? rulesOf(t.styleSheet) : [t]);

  const rootTokenNames = (): readonly string[] => [...document.styleSheets]
    .filter(t => t.href === null || new URL(t.href).origin === location.origin)
    .flatMap(t => rulesOf(t))
    .filter(t => t instanceof CSSStyleRule)
    .filter(t => t.selectorText.split(",").map(u => u.trim()).includes(":root"))
    .flatMap(t => [...t.style].filter(u => u.startsWith("--nol-") && !u.startsWith("--nol-docs-")));

  afterEach(() => DocsFixture.resetAsync());

  it("lists every token the kit's stylesheets define on the page's root, each once", async () => {
    const host = await renderAsync("/tokens");
    const names = shownNames(host);
    const defined = new Set(rootTokenNames());

    expect(defined.size).toBeGreaterThan(KitResources.colorTokens.length + KitResources.lookTokens.length);
    expect(new Set(names).size).toBe(names.length);
    expect([...names].sort()).toEqual([...defined].sort());
  });

  it("shows each color token's value in the default theme's Light and Dark modes", async () => {
    const host = await renderAsync("/tokens");
    const shown = shownValues(host);
    const theme = DefaultTheme.theme;

    expect(KitResources.colorTokens.map(t => [t.variable, ...shown.get(t.variable) ?? []]))
      .toEqual(KitResources.colorTokens.map(t => [t.variable, t.resolve(theme, ThemeMode.Light), t.resolve(theme, ThemeMode.Dark)]));
  });

  it("shows each look token's value from the default theme in both modes", async () => {
    const host = await renderAsync("/tokens");
    const shown = shownValues(host);
    const theme = DefaultTheme.theme;

    expect(lookVariables().map(t => [t, ...shown.get(t) ?? []]))
      .toEqual(KitResources.lookTokens.map(t => [KitResources.formatLookVariable(t), theme.readLook(t), theme.readLook(t)]));
  });

  it("shows each token of the kit's base styles with the value its declaration gives, in both modes", async () => {
    const host = await renderAsync("/tokens");
    const themed = new Set([...KitResources.colorTokens.map(t => t.variable), ...lookVariables()]);
    const base = [...shownValues(host)].filter(([name]) => !themed.has(name));

    expect(base.map(([name]) => name)).toEqual(expect.arrayContaining(["--nol-font-sans", "--nol-text-panel", "--nol-line-panel", "--nol-weight-emphasis", "--nol-text-tab"]));
    expect(base.filter(([name, values]) => values[0] !== values[1] || !kitBaseStyles.includes(`${name}: ${values[0] ?? ""};`)).map(([name]) => name)).toEqual([]);
  });

  it("shows a value the two modes share once, in one cell across both columns, and a value that changes in a cell for each mode", async () => {
    const host = await renderAsync("/tokens");
    const rows = DocsFixture.all(host, "main tbody tr");
    const shape = (row: HTMLElement): readonly number[] => DocsFixture.all(row, "td").map(t => t.colSpan);
    const shared = rows.filter(t => DocsFixture.all(t, "td").length === 1);
    const changing = rows.filter(t => DocsFixture.all(t, "td").length === 2);

    expect(shared.length).toBeGreaterThan(0);
    expect(changing.length).toBeGreaterThan(0);
    expect(shared.length + changing.length).toBe(rows.length);
    expect(new Set(shared.map(t => shape(t).join()))).toEqual(new Set(["2"]));
    expect(changing.filter(t => cellText(t, "td:nth-of-type(1)") === cellText(t, "td:nth-of-type(2)")).map(t => cellText(t, "th"))).toEqual([]);
  });

  it("groups the tokens into tables named by their sections", async () => {
    const host = await renderAsync("/tokens");
    const sections = DocsFixture.all(host, "main .nol-docs-section");
    const titles = sections.map(t => t.querySelector("h2")?.textContent?.trim());

    expect(titles).toEqual(["Colors", "Text roles and fonts", "Spacing", "Radius", "Shadows", "Metrics", "Built from other tokens"]);
    expect(sections.map(t => DocsFixture.one(t, "table").getAttribute("aria-label"))).toEqual(titles);
    expect(DocsFixture.byText(host, "main h2", "Spacing").closest("section")?.textContent).toContain("--nol-space-4");
    expect(DocsFixture.byText(host, "main h2", "Radius").closest("section")?.textContent).toContain("--nol-radius-small");
    expect(DocsFixture.byText(host, "main h2", "Text roles and fonts").closest("section")?.textContent).toContain("--nol-text-heading");
  });

  it("paints a swatch of each color's value in each mode, inside its cell, and none for other tokens", async () => {
    const host = await renderAsync("/tokens");
    const colors = DocsFixture.byText(host, "main h2", "Colors").closest("section");
    if (colors === null)
      throw new TypeError("The Colors heading is outside a section.");
    const cells = DocsFixture.all(colors, "tbody td");
    const swatches = DocsFixture.all(colors, ".nol-docs-token-swatch");
    const misplaced = cells.filter(t => {
      const swatch = DocsFixture.one(t, ".nol-docs-token-swatch").getBoundingClientRect();
      const cell = t.getBoundingClientRect();
      return swatch.width <= 0 || swatch.height <= 0 || swatch.left < cell.left || swatch.right > cell.right;
    });

    expect(swatches.length).toBe(cells.length);
    expect(misplaced).toEqual([]);
    expect(DocsFixture.all(host, "main .nol-docs-token-swatch").length).toBe(swatches.length);
  });

  it("keeps each swatch's color, outlined in the system text color, under forced colors", async () => {
    const host = await renderAsync("/tokens");
    const swatches = DocsFixture.all(host, "main .nol-docs-token-swatch");
    const painted = swatches.map(t => getComputedStyle(t).backgroundColor);
    const forced = (value: string): Promise<unknown> => cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "forced-colors", value }] });
    await forced("active");
    try {
      const probe = host.appendChild(document.createElement("span"));
      probe.style.color = "CanvasText";
      const text = getComputedStyle(probe).color;
      probe.remove();

      expect(swatches.length).toBeGreaterThan(0);
      expect(swatches.map(t => getComputedStyle(t).backgroundColor)).toEqual(painted);
      expect(new Set(swatches.map(t => getComputedStyle(t).borderTopColor))).toEqual(new Set([text]));
    } finally {
      await forced("none");
    }
  });

  describe.each([
    ["Light", "light", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
    ["Dark", "dark", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
    ["Light", "light", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT],
    ["Dark", "dark", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT]
  ])("in the %s mode, a %s color scheme, at %ipx wide", (mode, scheme, width, height) => {
    it("keeps every token table inside the page's width, scrolling inside its holder", async () => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(width, height);
      const host = await renderAsync("/tokens");
      const edge = document.documentElement.clientWidth;

      expect(getComputedStyle(document.documentElement).colorScheme).toBe(scheme);
      expect(window.innerWidth).toBe(width);
      expect(DocsFixture.overflowWidth()).toBe(0);
      expect(DocsFixture.one(host, "main").getBoundingClientRect().right).toBeLessThanOrEqual(edge);
      expect(DocsFixture.all(host, "main .nol-docs-section, main .nol-docs-table-holder").filter(t => t.getBoundingClientRect().right > edge)).toEqual([]);
    });

    it("keeps every token's name on one line", async () => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(width, height);
      const host = await renderAsync("/tokens");
      const names = DocsFixture.all(host, "main tbody th code");

      expect(names.length).toBeGreaterThan(0);
      expect(names.filter(t => t.getClientRects().length !== 1).map(t => t.textContent)).toEqual([]);
    });
  });

  it("is reached from the menu, which marks its link current", async () => {
    const host = await renderAsync("/");
    const nav = DocsFixture.one(host, "nav");

    await userEvent.click(DocsFixture.byText(nav, "a", "Theme tokens"));

    await vi.waitFor(() => expect(heading(host)).toBe("Theme tokens"));
    expect(DocsFixture.byText(nav, "a", "Theme tokens").getAttribute("aria-current")).toBe("page");
    expect(DocsFixture.byText(nav, "a", "Getting started").getAttribute("aria-current")).toBeNull();
  });

  it("is reached from a search for its title", async () => {
    const host = await renderAsync("/");

    await userEvent.fill(DocsFixture.one(host, "input[type=search]"), "tokens");
    await vi.waitFor(() => expect(DocsFixture.all(host, ".nol-docs-search-result").map(t => t.textContent?.trim())).toContain("Theme tokens"));
    await userEvent.click(DocsFixture.byText(host, ".nol-docs-search-result", "Theme tokens"));

    await vi.waitFor(() => expect(heading(host)).toBe("Theme tokens"));
  });
});
