/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { page, userEvent } from "vitest/browser";

import { SiteHeaderComponent } from "../../../../src/app/components/site-header/site-header.component";
import { SiteSearchDirective } from "../../../../src/app/components/site-header/site-search.directive";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import type { Theme } from "../../../../src/app/models/theme";
import { SiteLink } from "../../../../src/app/models/site-link";
import { SiteSocialLink } from "../../../../src/app/models/site-social-link";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { EmulatedMediaFixture } from "../../../fixtures/emulated-media.fixture";

const wordmark = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 3'%3E%3Crect width='20' height='3'/%3E%3C/svg%3E";
const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1'/%3E%3C/svg%3E";

@Component({
  imports: [SiteHeaderComponent, SiteSearchDirective],
  template: `
    <nol-site-header [wordmark]="wordmark" name="TeamRun" version="v0.0.9" [links]="links" [social]="social" downloadHref="#download" [(menuOpen)]="menuOpen">
      <input nolSiteSearch type="search" aria-label="Search" />
    </nol-site-header>
    <main class="page">Content</main>
  `,
  styles: [".page { display: block; height: 300vh; background: linear-gradient(#000, #fff); }"]
})
class SiteHeaderScrollHostComponent {
  public readonly wordmark: string = wordmark;
  public readonly links: readonly SiteLink[] = [new SiteLink("Features", "#features", true), new SiteLink("Docs", "#docs")];
  public readonly social: readonly SiteSocialLink[] = [new SiteSocialLink("GitHub", "#github", icon)];
  public readonly menuOpen = signal(false);
}

// A color as its red, green and blue, 0 to 255, and its alpha, 0 to 1, from the rgb() or color(srgb) form a computed style gives.
class Rgba {
  public readonly red: number;
  public readonly green: number;
  public readonly blue: number;
  public readonly alpha: number;

  public constructor(red: number, green: number, blue: number, alpha: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  public static parse(color: string): Rgba {
    const numbers = (color.match(/-?\d+(\.\d+)?(e-?\d+)?/gu) ?? []).map(Number);
    const scale = color.startsWith("color(") ? 255 : 1;
    const [red = 0, green = 0, blue = 0, alpha = 1] = numbers;
    return new Rgba(red * scale, green * scale, blue * scale, alpha);
  }

  // The color this one shows over an opaque backdrop.
  public over(backdrop: Rgba): string {
    const mix = (top: number, bottom: number): number => Math.round(this.alpha * top + (1 - this.alpha) * bottom);
    return `rgb(${mix(this.red, backdrop.red)}, ${mix(this.green, backdrop.green)}, ${mix(this.blue, backdrop.blue)})`;
  }
}

// A color on the header, and the contrast it keeps over whatever scrolls under it.
class HeaderInk {
  public readonly name: string;
  public readonly read: (header: HTMLElement) => string;
  public readonly least: number;

  public constructor(name: string, read: (header: HTMLElement) => string, least: number) {
    this.name = name;
    this.read = read;
    this.least = least;
  }
}

// A stylesheet rule for the scrolled header, and the conditions of the rules it sits in, outermost first.
class ScrolledRule {
  public readonly rule: CSSStyleRule;
  public readonly conditions: readonly string[];

  public constructor(rule: CSSStyleRule, conditions: readonly string[]) {
    this.rule = rule;
    this.conditions = conditions;
  }
}

describe("SiteHeaderComponent while the page scrolls", () => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const black = new Rgba(0, 0, 0, 1);
  const white = new Rgba(255, 255, 255, 1);
  let fixture: ComponentFixture<SiteHeaderScrollHostComponent>;

  async function renderAsync(theme: Theme, mode: ThemeMode): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(SiteHeaderScrollHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  // Scrolls the page and waits for the scroll the header reads.
  async function scrollToAsync(top: number): Promise<void> {
    const scrolled = new Promise(resolve => window.addEventListener("scroll", resolve, { once: true }));
    window.scrollTo(0, top);
    await scrolled;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const header = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-site-header");
  const background = (): Rgba => Rgba.parse(getComputedStyle(header()).backgroundColor);
  const blur = (): string => getComputedStyle(header()).backdropFilter;
  const windowColor = (theme: Theme, mode: ThemeMode): Rgba => Rgba.parse(AppearanceFixture.readColor(theme, mode, "window"));
  const rem = (value: number): number => AppearanceFixture.toPixels(value);
  const expectOpaque = (theme: Theme, mode: ThemeMode): void => {
    expect([getComputedStyle(header()).backgroundColor, blur()]).toEqual([AppearanceFixture.readColor(theme, mode, "window"), "none"]);
  };
  const expectTranslucent = (theme: Theme, mode: ThemeMode): void => {
    const shown = background();
    const own = windowColor(theme, mode);

    expect([shown.red, shown.green, shown.blue].map(Math.round)).toEqual([own.red, own.green, own.blue]);
    expect(shown.alpha).toBeCloseTo(0.92, 3);
    expect(blur()).toMatch(/^saturate\((180%|1\.8)\) blur\([\d.]+px\)$/u);
    AppearanceFixture.expectPixels(Number.parseFloat(blur().replace(/^.*blur\(/u, "")), rem(1.25));
  };

  afterEach(async () => {
    // Waits for the scroll back, so that its event doesn't reach the next test.
    if (window.scrollY > 0) {
      const scrolled = new Promise(resolve => window.addEventListener("scroll", resolve, { once: true }));
      window.scrollTo(0, 0);
      await scrolled;
    }
    AppearanceFixture.reset();
    await EmulatedMediaFixture.resetAsync();
    await page.viewport(viewportWidth, viewportHeight);
  });

  for (const theme of AppearanceFixture.themes) {
    for (const mode of AppearanceFixture.modes) {
      it(`draws on the opaque window color at the top of the page, then stays at the top of the window and turns translucent over a blur once the page scrolls under it, ${theme.id} theme, ${mode}`, async () => {
        await renderAsync(theme, mode);
        expectOpaque(theme, mode);
        await scrollToAsync(400);

        AppearanceFixture.expectPixels(header().getBoundingClientRect().top, 0);
        expect(DomFixture.one(DomFixture.host(fixture), ".page").getBoundingClientRect().top).toBeLessThan(0);
        expectTranslucent(theme, mode);
      });

      it(`turns opaque again when the page scrolls back to the top, ${theme.id} theme, ${mode}`, async () => {
        await renderAsync(theme, mode);
        await scrollToAsync(400);
        expectTranslucent(theme, mode);
        await scrollToAsync(0);

        expect(header().classList.contains("nol-site-header-scrolled")).toBe(false);
        expectOpaque(theme, mode);
      });

      it(`starts translucent on a page opened part way down, ${theme.id} theme, ${mode}`, async () => {
        // The page is scrolled before the header renders, as when a link leads into it or it reloads there.
        const before = document.body.appendChild(document.createElement("div"));
        before.style.height = "300vh";
        try {
          const scrolled = new Promise(resolve => window.addEventListener("scroll", resolve, { once: true }));
          window.scrollTo(0, 400);
          await scrolled;
          await renderAsync(theme, mode);

          expectTranslucent(theme, mode);
        }
        finally {
          before.remove();
        }
      });

      it(`stays opaque while scrolled when the visitor asks for reduced transparency, ${theme.id} theme, ${mode}`, async () => {
        await EmulatedMediaFixture.emulateAsync("prefers-reduced-transparency", "reduce");
        await renderAsync(theme, mode);
        await scrollToAsync(400);

        expect(header().classList.contains("nol-site-header-scrolled")).toBe(true);
        expectOpaque(theme, mode);
      });

      it(`stays opaque while scrolled with its phone menu open, ${theme.id} theme, ${mode}`, async () => {
        await page.viewport(375, 812);
        await renderAsync(theme, mode);
        await scrollToAsync(400);
        expectTranslucent(theme, mode);
        await userEvent.click(DomFixture.one(header(), ".nol-site-menu-button"));
        await fixture.whenStable();

        expect(header().classList.contains("nol-site-header-scrolled")).toBe(true);
        expectOpaque(theme, mode);
      });

      it(`stays opaque while scrolled with its search open, ${theme.id} theme, ${mode}`, async () => {
        await page.viewport(375, 812);
        await renderAsync(theme, mode);
        await scrollToAsync(400);
        expectTranslucent(theme, mode);
        await userEvent.click(DomFixture.one(header(), ".nol-site-search-button"));
        await fixture.whenStable();

        expect(["nol-site-header-scrolled", "nol-site-header-searching"].map(t => header().classList.contains(t))).toEqual([true, true]);
        expectOpaque(theme, mode);
      });
    }
  }

  // The contrast holds for the kit's own colors; the fixture theme's colors only tell its tokens apart.
  for (const mode of AppearanceFixture.modes) {
    const theme = DefaultTheme.theme;
    for (const ink of [
      new HeaderInk("the current link", t => getComputedStyle(DomFixture.one(t, ".nol-site-nav-link-current")).color, 4.5),
      new HeaderInk("another link", t => getComputedStyle(DomFixture.one(t, ".nol-site-nav-link:not(.nol-site-nav-link-current)")).color, 4.5),
      new HeaderInk("the version", t => getComputedStyle(DomFixture.one(t, ".nol-site-version")).color, 4.5),
      new HeaderInk("the product's name", t => getComputedStyle(DomFixture.one(t, ".nol-site-lockup-name")).color, 4.5),
      new HeaderInk("a social icon", t => getComputedStyle(DomFixture.one(t, ".nol-site-social-icon")).backgroundColor, 3),
      new HeaderInk("the focus ring", () => AppearanceFixture.readColor(theme, mode, "accent"), 3)
    ]) {
      it(`keeps ${ink.name} at least ${ink.least}:1 on the translucent header over black or white content, ${mode}`, async () => {
        await renderAsync(theme, mode);
        await scrollToAsync(400);
        const shown = background();

        expect(shown.alpha).toBeLessThan(1);
        for (const backdrop of [black, white])
          expect(AppearanceFixture.contrast(ink.read(header()), shown.over(backdrop))).toBeGreaterThanOrEqual(ink.least);
      });
    }
  }

  // The stylesheet's rules for the scrolled header.
  function scrolledRules(): ScrolledRule[] {
    TestBed.createComponent(SiteHeaderScrollHostComponent).detectChanges();
    const found: ScrolledRule[] = [];
    const visit = (rule: CSSRule, conditions: readonly string[]): void => {
      if (rule instanceof CSSStyleRule && rule.selectorText.includes("nol-site-header-scrolled"))
        found.push(new ScrolledRule(rule, conditions));
      else if (rule instanceof CSSConditionRule)
        for (const child of rule.cssRules)
          visit(child, [...conditions, rule.conditionText]);
    };
    for (const sheet of document.styleSheets)
      for (const rule of sheet.cssRules)
        visit(rule, []);
    return found;
  }

  it("draws the translucent background only where the browser supports the blur, so the header stays opaque where it doesn't", () => {
    const translucent = scrolledRules().filter(t => t.rule.style.backgroundColor.includes("color-mix"));

    expect(translucent.map(t => t.conditions.length === 1 && t.conditions.at(0)?.includes("backdrop-filter") === true)).toEqual([true]);
  });

  it("keys the opaque case on a reduced-transparency request, so a browser that doesn't know the feature shows the translucent header", () => {
    const rules = scrolledRules();
    const translucent = rules.filter(t => t.rule.style.backgroundColor.includes("color-mix"));
    const reduced = rules.filter(t => t.conditions.some(c => c.includes("prefers-reduced-transparency")));

    expect(translucent.flatMap(t => t.conditions).filter(c => c.includes("prefers-reduced-transparency"))).toEqual([]);
    expect(reduced.map(t => [t.conditions.at(-1), t.rule.selectorText === translucent[0]?.rule.selectorText, t.rule.style.backdropFilter])).toEqual([["(prefers-reduced-transparency: reduce)", true, "none"]]);
  });
});
