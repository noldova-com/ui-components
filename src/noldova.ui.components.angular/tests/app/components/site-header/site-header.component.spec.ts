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
import { SiteLink } from "../../../../src/app/models/site-link";
import { SiteSocialLink } from "../../../../src/app/models/site-social-link";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

const formatWordmark = (width: number, height: number): string =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}'/%3E%3C/svg%3E`;
const unreadable = "data:image/svg+xml,unreadable";
const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1'/%3E%3C/svg%3E";

@Component({
  imports: [SiteHeaderComponent, SiteSearchDirective],
  template: `
    <nol-site-header [wordmark]="wordmark()" [wordmarkRatio]="wordmarkRatio()" [name]="name()" [version]="version()" [versionHref]="versionHref()" [links]="links()" [social]="social()"
      [downloadHref]="downloadHref()" [downloadLabel]="downloadLabel()" [wide]="wide()" [contentId]="contentId()" [(menuOpen)]="menuOpen" [(searchOpen)]="searchOpen">
      @if (hasSearch()) {
        <input nolSiteSearch type="search" aria-label="Search" />
      }
    </nol-site-header>
    <main id="main" tabindex="-1">Content <input class="outside" aria-label="Outside" /></main>
  `
})
class SiteHeaderHostComponent {
  public readonly wordmark = signal(formatWordmark(20, 3));
  public readonly wordmarkRatio = signal(20 / 3);
  public readonly name = signal<string | null>("TeamRun");
  public readonly version = signal<string | null>(null);
  public readonly versionHref = signal<string | null>(null);
  public readonly links = signal<readonly SiteLink[]>([new SiteLink("Features", "#features", true), new SiteLink("Docs", "#docs"), new SiteLink("Releases", "#releases")]);
  public readonly social = signal<readonly SiteSocialLink[]>([new SiteSocialLink("GitHub", "#github", icon), new SiteSocialLink("X", "#x", icon)]);
  public readonly downloadHref = signal<string | null>("#download");
  public readonly downloadLabel = signal("Download");
  public readonly wide = signal(false);
  public readonly contentId = signal<string | null>(null);
  public readonly hasSearch = signal(false);
  public readonly menuOpen = signal(false);
  public readonly searchOpen = signal(false);
}

@Component({
  imports: [SiteHeaderComponent],
  template: `<nol-site-header [wordmark]="wordmark" />`
})
class SiteHeaderDefaultRatioHostComponent {
  public readonly wordmark: string = unreadable;
}

class SearchCloseCase {
  public constructor(public readonly title: string, public readonly closeAsync: () => Promise<void>) {
  }
}

describe("SiteHeaderComponent", () => {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  let fixture: ComponentFixture<SiteHeaderHostComponent>;
  let host: SiteHeaderHostComponent;

  async function renderAsync(change: (host: SiteHeaderHostComponent) => void = () => undefined, theme = AppearanceFixture.themes[0], mode = AppearanceFixture.modes[0]): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(SiteHeaderHostComponent);
    host = fixture.componentInstance;
    change(host);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.all(DomFixture.allOf(header(), "img.nol-site-wordmark-size", HTMLImageElement).map(t => t.decode()));
  }

  async function phoneAsync(): Promise<void> {
    await page.viewport(375, 812);
  }

  async function openAsync(): Promise<void> {
    await userEvent.click(menuButton());
    await fixture.whenStable();
  }

  const header = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-site-header");
  const bar = (): HTMLElement => DomFixture.one(header(), ".nol-site-header-bar");
  const part = (selector: string): HTMLElement => DomFixture.one(header(), selector);
  const maybe = (selector: string): HTMLElement | null => DomFixture.maybe(header(), selector);
  const all = (selector: string): HTMLElement[] => DomFixture.all(header(), selector);
  const box = (selector: string): DOMRect => part(selector).getBoundingClientRect();
  const menuButton = (): HTMLButtonElement => DomFixture.oneOf(header(), ".nol-site-menu-button", HTMLButtonElement);
  const searchButton = (): HTMLButtonElement => DomFixture.oneOf(header(), ".nol-site-search-button", HTMLButtonElement);
  const field = (): HTMLInputElement => DomFixture.oneOf(header(), "input[nolSiteSearch]", HTMLInputElement);

  async function searchAsync(): Promise<void> {
    await userEvent.click(searchButton());
    await fixture.whenStable();
  }
  const shown = (selector: string): boolean => getComputedStyle(part(selector)).display !== "none";
  const edges = (): DOMRect => header().getBoundingClientRect();
  const contentLeft = (): number => bar().getBoundingClientRect().left + Number.parseFloat(getComputedStyle(bar()).paddingLeft);
  const contentRight = (): number => bar().getBoundingClientRect().right - Number.parseFloat(getComputedStyle(bar()).paddingRight);
  const pill = (): HTMLElement => DomFixture.one(header(), "nol-site-theme-switch .nol-choice-pill[tabindex='0']");
  async function tabsAsync(expected: readonly HTMLElement[]): Promise<number[]> {
    const focused = (): number => expected.findIndex(t => t === document.activeElement);
    const order = [focused()];
    for (let index = 1; index < expected.length; index++) {
      await userEvent.keyboard("{Tab}");
      order.push(focused());
    }
    return order;
  }

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
    await page.viewport(viewport.width, viewport.height);
    document.documentElement.removeAttribute("data-nol-theme-mode");
  });

  it("is the page's banner, sticky at the top on the panel color, with no border", async () => {
    await renderAsync();
    const style = getComputedStyle(header());

    expect([header().getAttribute("role"), style.position, style.top, style.borderBottomWidth, getComputedStyle(bar()).borderBottomWidth, style.backgroundColor])
      .toEqual(["banner", "sticky", "0px", "0px", "0px", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "panel")]);
  });

  it("links the lockup home, named for the product's home, its wordmark a mask at the wordmark height and the wordmark's proportions", async () => {
    await renderAsync();
    const link = DomFixture.oneOf(header(), ".nol-site-lockup-link", HTMLAnchorElement);
    const mark = part(".nol-site-wordmark");
    const size = mark.getBoundingClientRect();

    expect([link.getAttribute("href"), link.getAttribute("aria-label"), part(".nol-site-lockup-name").textContent?.trim(), getComputedStyle(mark).maskImage.includes("data:image/svg+xml")])
      .toEqual(["/", "TeamRun home", "TeamRun", true]);
    AppearanceFixture.expectPixels(size.height, AppearanceFixture.measureLook("site-wordmark"));
    expect(size.width / size.height).toBeCloseTo(20 / 3, 1);
  });

  it("draws the wordmark in the proportions of the file the site passes", async () => {
    await renderAsync(t => t.wordmark.set(formatWordmark(10, 3)));
    const size = box(".nol-site-wordmark");

    AppearanceFixture.expectPixels(size.height, AppearanceFixture.measureLook("site-wordmark"));
    expect(size.width / size.height).toBeCloseTo(10 / 3, 1);
  });

  it("reserves the wordmark's width from the ratio the site passes before its file loads, so the name after it doesn't move when it does", async () => {
    AppearanceFixture.apply(AppearanceFixture.themes[0], AppearanceFixture.modes[0]);
    fixture = TestBed.createComponent(SiteHeaderHostComponent);
    fixture.componentInstance.wordmark.set(unreadable);
    fixture.componentInstance.wordmarkRatio.set(10 / 3);
    fixture.detectChanges();
    await fixture.whenStable();
    const image = DomFixture.oneOf(header(), "img.nol-site-wordmark-size", HTMLImageElement);
    const isUnloaded = image.naturalWidth === 0;
    const widthBefore = box(".nol-site-wordmark").width;
    const nameBefore = box(".nol-site-lockup-name").left;
    fixture.componentInstance.wordmark.set(formatWordmark(10, 3));
    fixture.detectChanges();
    await image.decode();
    const width = box(".nol-site-wordmark").width;

    expect([isUnloaded, image.naturalWidth > 0]).toEqual([true, true]);
    AppearanceFixture.expectPixels(width, AppearanceFixture.measureLook("site-wordmark") * 10 / 3);
    AppearanceFixture.expectPixels(widthBefore, width);
    AppearanceFixture.expectPixels(nameBefore, box(".nol-site-lockup-name").left);
  });

  it("reserves the Noldova wordmark's width when the site passes no ratio, even for a file that never loads", async () => {
    AppearanceFixture.apply(AppearanceFixture.themes[0], AppearanceFixture.modes[0]);
    const other = TestBed.createComponent(SiteHeaderDefaultRatioHostComponent);
    other.detectChanges();
    await other.whenStable();
    const size = DomFixture.one(DomFixture.host(other), ".nol-site-wordmark").getBoundingClientRect();

    AppearanceFixture.expectPixels(size.height, AppearanceFixture.measureLook("site-wordmark"));
    expect(size.width / size.height).toBeCloseTo(1333.817 / 201.396, 2);
    other.destroy();
  });

  for (const theme of AppearanceFixture.themes)
    it(`draws the product's name at the ${theme.id} theme's site name size and line, at the emphasis weight`, async () => {
      await renderAsync(() => undefined, theme);
      const name = getComputedStyle(part(".nol-site-lockup-name"));

      AppearanceFixture.expectLook(name.fontSize, theme, "site-name-text", "font-size");
      AppearanceFixture.expectLook(name.lineHeight, theme, "site-name-line", "line-height");
      expect(name.fontWeight).toBe("500");
    });

  for (const name of [null, " "])
    it(`names the lockup Noldova home when the product name is ${JSON.stringify(name)}`, async () => {
      await renderAsync(t => t.name.set(name));

      expect([part(".nol-site-lockup-link").getAttribute("aria-label"), maybe(".nol-site-lockup-name")]).toEqual(["Noldova home", null]);
    });

  it("names the lockup link by the product it is given, such as Commitline home, as its accessible name", async () => {
    await renderAsync(t => t.name.set("Commitline"));
    const link = DomFixture.oneOf(header(), ".nol-site-lockup-link", HTMLAnchorElement);

    expect([link.getAttribute("aria-label"), page.getByRole("link", { name: "Commitline home", exact: true }).elements().includes(link)]).toEqual(["Commitline home", true]);
  });

  it("draws no product name without one", async () => {
    await renderAsync(t => t.name.set(null));

    expect(maybe(".nol-site-lockup-name")).toBeNull();
  });

  it("draws no version without one, the version as text without a link, and as a link with one", async () => {
    await renderAsync();
    const none = maybe(".nol-site-version");
    host.version.set("v0.0.9");
    fixture.detectChanges();
    const text = [part(".nol-site-version").tagName, part(".nol-site-version").textContent?.trim()];
    host.versionHref.set("#release");
    fixture.detectChanges();

    expect([none, text, [part(".nol-site-version").tagName, part(".nol-site-version").getAttribute("href")]]).toEqual([null, ["SPAN", "v0.0.9"], ["A", "#release"]]);
  });

  it("draws the version in small muted text three eighths of a space step after the lockup", async () => {
    await renderAsync(t => t.version.set("v0.0.9"));
    const style = getComputedStyle(part(".nol-site-version"));

    expect(style.color).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "text-muted"));
    AppearanceFixture.expectPixels(Number.parseFloat(style.fontSize), AppearanceFixture.measureLook("text-small"));
    AppearanceFixture.expectPixels(box(".nol-site-version").left - box("nol-site-lockup").right, AppearanceFixture.measureLook("space-2") - AppearanceFixture.measureLook("space-half"));
  });

  it("marks only the current page's link, in a navigation named Site", async () => {
    await renderAsync();

    expect(part(".nol-site-header-nav").getAttribute("aria-label")).toBe("Site");
    expect(all(".nol-site-nav-link").map(t => [t.textContent?.trim(), t.getAttribute("href"), t.getAttribute("aria-current")]))
      .toEqual([["Features", "#features", "page"], ["Docs", "#docs", null], ["Releases", "#releases", null]]);
  });

  it("draws no navigation without links, and keeps the tools at the bar's end", async () => {
    await renderAsync(t => t.links.set([]));

    expect(maybe(".nol-site-header-nav")).toBeNull();
    AppearanceFixture.expectPixels(box(".nol-site-download").right, contentRight());
  });

  it("draws the current link strong and the others muted, each at least a pointer target high", async () => {
    await renderAsync();
    const [current, other] = all(".nol-site-nav-link").map(t => getComputedStyle(t));
    const colors = (key: string): string => AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, key);

    expect([current?.color, current?.fontWeight, other?.color]).toEqual([colors("text-strong"), "500", colors("text-muted")]);
    for (const link of all(".nol-site-nav-link"))
      expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("pointer-target") - 1 / 32);
  });

  it("fills a hovered link with the toolbar hover color", async () => {
    await renderAsync();
    const link = DomFixture.at(all(".nol-site-nav-link"), 1);
    link.setAttribute("data-nol-state", "Hover");

    expect(getComputedStyle(link).backgroundColor).not.toBe(getComputedStyle(DomFixture.at(all(".nol-site-nav-link"), 2)).backgroundColor);
    expect(getComputedStyle(link).color).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "text-strong"));
  });

  it("outlines a focused link in the accent color inside its edge", async () => {
    await renderAsync();
    const link = DomFixture.at(all(".nol-site-nav-link"), 1);
    link.setAttribute("data-nol-state", "Focus");
    const style = getComputedStyle(link);

    expect([style.outlineStyle, style.outlineColor]).toEqual(["solid", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent")]);
    AppearanceFixture.expectPixels(Number.parseFloat(style.outlineOffset), -AppearanceFixture.measureLook("border-width"));
  });

  it("starts the links' text two space steps after the lockup and a space-6 step apart, and puts the tools, then Download, at the bar's end, without a search", async () => {
    await renderAsync();
    const step = AppearanceFixture.measureLook("space-2");
    const links = all(".nol-site-nav-link");
    const text = (link: HTMLElement): DOMRect => {
      const range = document.createRange();
      range.selectNodeContents(link);
      return range.getBoundingClientRect();
    };
    const socials = all(".nol-site-social").map(t => t.getBoundingClientRect());

    expect(shown(".nol-site-header-search")).toBe(false);
    AppearanceFixture.expectPixels(box(".nol-site-header-brand").left, contentLeft());
    AppearanceFixture.expectPixels(text(DomFixture.at(links, 0)).left - box(".nol-site-header-brand").right, step * 4);
    AppearanceFixture.expectPixels(text(DomFixture.at(links, 1)).left - text(DomFixture.at(links, 0)).right, AppearanceFixture.measureLook("space-6"));
    AppearanceFixture.expectPixels(DomFixture.at(socials, 1).left - DomFixture.at(socials, 0).right, step);
    AppearanceFixture.expectPixels(box("nol-site-theme-switch").left - DomFixture.at(socials, 1).right, step * 2);
    AppearanceFixture.expectPixels(box(".nol-site-download").left - box(".nol-site-header-tools").right, step * 2);
    AppearanceFixture.expectPixels(box(".nol-site-download").right, contentRight());
  });

  it("draws a projected search at the search width before the tools", async () => {
    await renderAsync(t => t.hasSearch.set(true));
    const search = box(".nol-site-header-search");

    AppearanceFixture.expectPixels(search.width, AppearanceFixture.measureLook("site-search-width"));
    AppearanceFixture.expectPixels(box(".nol-site-header-tools").left - search.right, AppearanceFixture.measureLook("space-2") * 2);
    expect(search.left).toBeGreaterThan(box(".nol-site-header-nav").right);
    AppearanceFixture.expectPixels(box(".nol-site-download").right, contentRight());
  });

  it("draws each social link as an icon button in the strong text color, named and tooltipped by its label, its icon a mask at the icon size", async () => {
    await renderAsync();
    const links = all(".nol-site-social");
    const target = AppearanceFixture.measureLook("icon-button-target");
    const iconSize = AppearanceFixture.measureLook("icon");

    expect(links.map(t => [t.getAttribute("href"), t.getAttribute("aria-label")])).toEqual([["#github", "GitHub"], ["#x", "X"]]);
    for (const link of links) {
      const glyph = DomFixture.one(link, ".nol-site-social-icon");
      AppearanceFixture.expectPixels(link.getBoundingClientRect().width, target);
      AppearanceFixture.expectPixels(link.getBoundingClientRect().height, target);
      AppearanceFixture.expectPixels(glyph.getBoundingClientRect().width, iconSize);
      expect(getComputedStyle(link).color).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "text-strong"));
      expect([glyph.getAttribute("aria-hidden"), getComputedStyle(glyph).maskImage.includes("data:image/svg+xml")]).toEqual(["true", true]);
    }
  });

  it("draws Download with its label, and no button without a link", async () => {
    await renderAsync(t => t.downloadLabel.set("Get TeamRun"));
    const labelled = [part(".nol-site-download").getAttribute("href"), part(".nol-site-download").textContent?.replace("download", String.empty).trim()];
    host.downloadHref.set(null);
    fixture.detectChanges();

    expect([labelled, maybe(".nol-site-download")]).toEqual([["#download", "Get TeamRun"], null]);
  });

  for (const theme of AppearanceFixture.themes)
    it(`draws Download at the ${theme.id} theme's button height with no edge, its label in panel text at the emphasis weight, its icon a half space step into its padding`, async () => {
      await renderAsync(() => undefined, theme);
      const download = part(".nol-site-download");
      const style = getComputedStyle(download);
      const glyph = part(".nol-site-download-icon").getBoundingClientRect();

      expect([style.borderTopWidth, style.borderLeftWidth, style.fontWeight]).toEqual(["0px", "0px", "500"]);
      AppearanceFixture.expectPixels(Number.parseFloat(style.fontSize), AppearanceFixture.measureLook("text-panel"));
      AppearanceFixture.expectPixels(download.getBoundingClientRect().height, AppearanceFixture.measureLook("button-height"));
      AppearanceFixture.expectPixels(glyph.left - download.getBoundingClientRect().left, AppearanceFixture.measureLook("button-padding") - AppearanceFixture.measureLook("space-half"));
      AppearanceFixture.expectPixels(glyph.width, AppearanceFixture.measureLook("icon"));
    });

  it("draws no skip link without the content's id, and one to the content that shows only while focused", async () => {
    await renderAsync();
    const none = maybe(".nol-site-skip");
    host.contentId.set("main");
    fixture.detectChanges();
    const skip = part(".nol-site-skip");
    const hidden = skip.getBoundingClientRect().bottom <= edges().top;
    skip.focus();

    expect([none, skip.getAttribute("href"), skip.textContent?.trim(), hidden, skip.getBoundingClientRect().top >= edges().top]).toEqual([null, "#main", "Skip to content", true, true]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its height, inset and content width from the ${theme.id} theme in ${mode} mode`, async () => {
        await page.viewport(1920, 1000);
        await renderAsync(() => undefined, theme, mode);
        const style = getComputedStyle(bar());
        const width = AppearanceFixture.measureLook("site-content-width");

        AppearanceFixture.expectPixels(bar().getBoundingClientRect().height, AppearanceFixture.measureLook("site-header-height"));
        AppearanceFixture.expectLook(style.paddingLeft, theme, "site-padding-inline", "padding-left");
        AppearanceFixture.expectLook(style.paddingRight, theme, "site-padding-inline", "padding-right");
        AppearanceFixture.expectPixels(bar().getBoundingClientRect().width, width);
        AppearanceFixture.expectPixels(bar().getBoundingClientRect().left - edges().left, (edges().width - width) / 2);
      });

  it("widens to the wide content width on a documentation site", async () => {
    await page.viewport(1920, 1000);
    await renderAsync(t => t.wide.set(true));

    AppearanceFixture.expectPixels(bar().getBoundingClientRect().width, Math.min(edges().width, AppearanceFixture.measureLook("site-content-width-wide")));
  });

  it("hides the menu button on a desktop window", async () => {
    await renderAsync();

    expect(shown(".nol-site-menu-button")).toBe(false);
  });

  for (const theme of AppearanceFixture.themes)
    it(`keeps the lockup, Download and a closed menu button a menu row high on a phone, its glyph at the content's end, hiding the rest, with the ${theme.id} theme`, async () => {
      await phoneAsync();
      await renderAsync(t => t.hasSearch.set(true), theme);
      const panel = DomFixture.one(document, `#${menuButton().getAttribute("aria-controls")}`);
      const row = AppearanceFixture.measureLook("site-menu-row");
      const glyph = AppearanceFixture.measureLook("site-menu-glyph");
      const inset = AppearanceFixture.measureLook("site-padding-inline-phone");
      const download = part(".nol-site-download");
      const icon = part(".nol-site-download-icon").getBoundingClientRect();

      expect([menuButton().getAttribute("aria-expanded"), menuButton().getAttribute("aria-label"), panel.classList.contains("nol-site-header-panel")]).toEqual(["false", "Menu", true]);
      expect([".nol-site-header-search", ".nol-site-header-nav", ".nol-site-header-tools"].map(shown)).toEqual([false, false, false]);
      AppearanceFixture.expectPixels(bar().getBoundingClientRect().height, AppearanceFixture.measureLook("site-header-height"));
      AppearanceFixture.expectPixels(box(".nol-site-menu-button").width, row);
      AppearanceFixture.expectPixels(box(".nol-site-menu-button").height, row);
      AppearanceFixture.expectPixels(DomFixture.one(menuButton(), ".nol-icon-button-glyph").getBoundingClientRect().width, glyph);
      AppearanceFixture.expectPixels(box(".nol-site-menu-button").right, edges().right - inset + (row - glyph) / 2);
      AppearanceFixture.expectPixels(box(".nol-site-header-brand").left, edges().left + inset);
      AppearanceFixture.expectPixels(box(".nol-site-search-button").left - box(".nol-site-download").right, AppearanceFixture.measureLook("space-2"));
      AppearanceFixture.expectPixels(box(".nol-site-menu-button").left - box(".nol-site-search-button").right, AppearanceFixture.measureLook("space-2"));
      AppearanceFixture.expectPixels(download.getBoundingClientRect().height, row);
      AppearanceFixture.expectPixels(icon.width, AppearanceFixture.measureLook("site-download-glyph-phone"));
      AppearanceFixture.expectPixels(icon.left - download.getBoundingClientRect().left, AppearanceFixture.measureLook("space-3") - AppearanceFixture.measureLook("space-half"));
    });

  it("opens the links in rows and the tools under the bar on a phone, the theme switch at the end, without the search", async () => {
    await phoneAsync();
    await renderAsync(t => t.hasSearch.set(true));
    await openAsync();
    await userEvent.hover(part(".nol-site-header-brand"));
    const inset = AppearanceFixture.measureLook("site-padding-inline-phone");
    const rows = all(".nol-site-nav-link").map(t => t.getBoundingClientRect());
    const rowHeight = AppearanceFixture.measureLook("site-menu-row");
    const colors = (key: string): string => AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, key);
    const [current, other] = all(".nol-site-nav-link").map(t => getComputedStyle(t));
    const pills = DomFixture.all(part("nol-site-theme-switch"), ".nol-choice-pill").map(t => t.getBoundingClientRect());

    expect([menuButton().getAttribute("aria-expanded"), menuButton().textContent?.trim()]).toEqual(["true", "close"]);
    expect([getComputedStyle(menuButton(), "::before").backgroundColor, current?.color, other?.color]).toEqual([colors("selected"), colors("text-strong"), colors("text")]);
    AppearanceFixture.expectPixels(Number.parseFloat(other?.fontSize ?? String.empty), AppearanceFixture.measureLook("site-menu-text"));
    expect(shown(".nol-site-header-search")).toBe(false);
    AppearanceFixture.expectPixels(DomFixture.at(rows, 0).top - bar().getBoundingClientRect().top - AppearanceFixture.measureLook("site-header-height"), AppearanceFixture.measureLook("space-1"));
    AppearanceFixture.expectPixels(box(".nol-site-header-tools").top - DomFixture.at(rows, rows.length - 1).bottom, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(edges().bottom - box(".nol-site-header-tools").bottom, AppearanceFixture.measureLook("space-4"));
    for (const target of [...all(".nol-site-social").map(t => t.getBoundingClientRect()), ...pills]) {
      AppearanceFixture.expectPixels(target.width, rowHeight);
      AppearanceFixture.expectPixels(target.height, rowHeight);
    }
    AppearanceFixture.expectPixels(box(".nol-site-social-icon").width, AppearanceFixture.measureLook("site-menu-icon"));
    for (const [index, row] of rows.entries()) {
      AppearanceFixture.expectPixels(row.height, rowHeight);
      AppearanceFixture.expectPixels(row.width, edges().width - inset * 2);
      AppearanceFixture.expectPixels(row.top, DomFixture.at(rows, 0).top + index * rowHeight);
    }
    AppearanceFixture.expectPixels(box(".nol-site-social").left, edges().left + inset);
    AppearanceFixture.expectPixels(box("nol-site-theme-switch").right, edges().right - inset);
  });

  it("hides the search button on a desktop window and on a phone without a search", async () => {
    await renderAsync(t => t.hasSearch.set(true));
    const desktop = shown(".nol-site-search-button");
    await phoneAsync();
    host.hasSearch.set(false);
    fixture.detectChanges();

    expect([desktop, shown(".nol-site-search-button")]).toEqual([false, false]);
    AppearanceFixture.expectPixels(box(".nol-site-menu-button").left - box(".nol-site-download").right, AppearanceFixture.measureLook("space-2"));
  });

  for (const theme of AppearanceFixture.themes)
    it(`puts a search button a menu row square before the menu button on a phone for a documentation site, with the ${theme.id} theme`, async () => {
      await phoneAsync();
      await renderAsync(t => {
        t.hasSearch.set(true);
        t.wide.set(true);
      }, theme);
      const row = AppearanceFixture.measureLook("site-menu-row");
      const button = box(".nol-site-search-button");

      expect([searchButton().getAttribute("aria-label"), searchButton().getAttribute("aria-expanded"), searchButton().getAttribute("aria-controls"), searchButton().textContent?.trim()])
        .toEqual(["Search", "false", part(".nol-site-header-search").id, "search"]);
      expect([shown(".nol-site-header-search"), shown(".nol-site-download")]).toEqual([false, false]);
      AppearanceFixture.expectPixels(button.width, row);
      AppearanceFixture.expectPixels(button.height, row);
      AppearanceFixture.expectPixels(DomFixture.one(searchButton(), ".nol-icon-button-glyph").getBoundingClientRect().width, AppearanceFixture.measureLook("site-menu-glyph"));
      AppearanceFixture.expectPixels(button.top, bar().getBoundingClientRect().top + (AppearanceFixture.measureLook("site-header-height") - row) / 2);
      AppearanceFixture.expectPixels(box(".nol-site-menu-button").left - button.right, AppearanceFixture.measureLook("space-2"));
    });

  it("opens the search under the bar on a phone with its button, across the content, focused on its field, and closes the menu", async () => {
    await phoneAsync();
    await renderAsync(t => {
      t.hasSearch.set(true);
      t.wide.set(true);
    });
    await openAsync();

    await searchAsync();
    await userEvent.hover(part(".nol-site-header-brand"));
    const inset = AppearanceFixture.measureLook("site-padding-inline-phone");
    const search = box(".nol-site-header-search");

    expect([searchButton().getAttribute("aria-expanded"), host.searchOpen(), host.menuOpen(), shown(".nol-site-header-nav"), document.activeElement === field()])
      .toEqual(["true", true, false, false, true]);
    expect(getComputedStyle(searchButton(), "::before").backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "selected"));
    AppearanceFixture.expectPixels(search.top, bar().getBoundingClientRect().top + AppearanceFixture.measureLook("site-header-height"));
    AppearanceFixture.expectPixels(search.left, edges().left + inset);
    AppearanceFixture.expectPixels(search.width, edges().width - inset * 2);
    AppearanceFixture.expectPixels(edges().bottom - search.bottom, AppearanceFixture.measureLook("space-4"));
  });

  it("closes the search when the menu opens", async () => {
    await phoneAsync();
    await renderAsync(t => t.hasSearch.set(true));
    await searchAsync();

    await openAsync();

    expect([host.searchOpen(), shown(".nol-site-header-search"), host.menuOpen()]).toEqual([false, false, true]);
  });

  it("closes the search with its button", async () => {
    await phoneAsync();
    await renderAsync(t => t.hasSearch.set(true));
    await searchAsync();

    await searchAsync();

    expect([searchButton().getAttribute("aria-expanded"), shown(".nol-site-header-search")]).toEqual(["false", false]);
  });

  it("closes the search with Escape and returns the focus to its button", async () => {
    await phoneAsync();
    await renderAsync(t => t.hasSearch.set(true));
    await searchAsync();

    await userEvent.keyboard("{Escape}");
    await fixture.whenStable();

    expect([host.searchOpen(), shown(".nol-site-header-search"), document.activeElement === searchButton()]).toEqual([false, false, true]);
  });

  it("keeps the search open on a tap in it, and closes it on a tap outside, leaving the focus where the tap put it", async () => {
    await phoneAsync();
    await renderAsync(t => t.hasSearch.set(true));
    await searchAsync();

    await userEvent.click(field());
    await fixture.whenStable();
    const inside = [host.searchOpen(), document.activeElement === field()];
    const outside = DomFixture.oneOf(document, "input.outside", HTMLInputElement);
    await userEvent.click(outside);
    await fixture.whenStable();

    expect([inside, host.searchOpen(), shown(".nol-site-header-search"), document.activeElement === outside]).toEqual([[true, true], false, false, true]);
  });

  for (const { title, closeAsync } of [
    new SearchCloseCase("the menu", async () => {
      await openAsync();
      await openAsync();
    }),
    new SearchCloseCase("the site", async () => {
      host.searchOpen.set(false);
      await fixture.whenStable();
    })
  ])
    it(`keeps a search the site opens open on a tap outside after ${title} closed one its button opened`, async () => {
      await phoneAsync();
      await renderAsync(t => t.hasSearch.set(true));
      await searchAsync();
      await closeAsync();

      host.searchOpen.set(true);
      await fixture.whenStable();
      await userEvent.click(DomFixture.one(document, "main"));
      await fixture.whenStable();

      expect([host.searchOpen(), shown(".nol-site-header-search")]).toEqual([true, true]);
    });

  it("moves the focus to the first link when the menu opens on a phone, and Tab goes on through the menu in the order it is drawn", async () => {
    await phoneAsync();
    await renderAsync(t => {
      t.hasSearch.set(true);
      t.wide.set(true);
    });
    await openAsync();

    const expected = [...all(".nol-site-nav-link"), ...all(".nol-site-social"), pill(), part(".nol-site-download")];

    expect(await tabsAsync(expected)).toEqual(expected.map((_, index) => index));
  });

  it("follows the bar in the order it is drawn with Tab on a desktop window: the lockup, the links, the search, the tools, then Download", async () => {
    await renderAsync(t => t.hasSearch.set(true));
    DomFixture.oneOf(header(), ".nol-site-lockup-link", HTMLAnchorElement).focus();
    const drawn = [".nol-site-lockup-link", ".nol-site-nav-link", "input[nolSiteSearch]", ".nol-site-social", "nol-site-theme-switch", ".nol-site-download"]
      .map(t => DomFixture.all(header(), t).map(part => part.getBoundingClientRect().left))
      .flat();

    const expected = [part(".nol-site-lockup-link"), ...all(".nol-site-nav-link"), field(), ...all(".nol-site-social"), pill(), part(".nol-site-download")];

    expect(await tabsAsync(expected)).toEqual(expected.map((_, index) => index));
    expect(drawn).toEqual([...drawn].sort((a, b) => a - b));
  });

  it("keeps a search its owner opened open on a tap outside, and closes it with Escape", async () => {
    await phoneAsync();
    await renderAsync(t => {
      t.hasSearch.set(true);
      t.searchOpen.set(true);
    });
    const opened = shown(".nol-site-header-search");

    await userEvent.click(DomFixture.one(document, "main"));
    await fixture.whenStable();
    const tapped = [host.searchOpen(), document.activeElement === searchButton()];
    field().focus();
    await userEvent.keyboard("{Escape}");
    await fixture.whenStable();

    expect([opened, tapped, host.searchOpen(), document.activeElement === searchButton()]).toEqual([true, [true, false], false, true]);
  });

  it("leaves the focus alone on a tap once its search is closed", async () => {
    await phoneAsync();
    await renderAsync(t => t.hasSearch.set(true));
    await searchAsync();
    await searchAsync();

    await userEvent.click(DomFixture.one(document, "main"));

    expect([host.searchOpen(), document.activeElement === searchButton()]).toEqual([false, false]);
  });

  it("closes the menu with Escape and returns the focus to its button, and leaves the focus alone on Escape while closed", async () => {
    await phoneAsync();
    await renderAsync();
    await openAsync();
    DomFixture.at(all(".nol-site-nav-link"), 0).focus();

    await userEvent.keyboard("{Escape}");
    await fixture.whenStable();
    const closed = [menuButton().getAttribute("aria-expanded"), document.activeElement === menuButton(), shown(".nol-site-header-nav")];
    part(".nol-site-download").focus();
    await userEvent.keyboard("{Escape}");

    expect([closed, document.activeElement === part(".nol-site-download")]).toEqual([["false", true, false], true]);
  });

  it("closes the menu when a link in it is followed", async () => {
    await phoneAsync();
    await renderAsync();
    await openAsync();
    header().addEventListener("click", t => t.preventDefault());

    await userEvent.click(DomFixture.at(all(".nol-site-nav-link"), 1));
    await fixture.whenStable();

    expect([menuButton().getAttribute("aria-expanded"), shown(".nol-site-header-nav")]).toEqual(["false", false]);
  });

  it("closes the open menu with its button", async () => {
    await phoneAsync();
    await renderAsync();
    await openAsync();

    await openAsync();

    expect([menuButton().getAttribute("aria-expanded"), shown(".nol-site-header-tools")]).toEqual(["false", false]);
  });

  it("opens and closes the menu from its owner, and tells the owner when its button changes it", async () => {
    await phoneAsync();
    await renderAsync(t => t.menuOpen.set(true));
    const opened = [menuButton().getAttribute("aria-expanded"), shown(".nol-site-header-nav")];
    host.menuOpen.set(false);
    fixture.detectChanges();
    const closed = menuButton().getAttribute("aria-expanded");

    await openAsync();

    expect([opened, closed, host.menuOpen()]).toEqual([["true", true], "false", true]);
  });

  it("ends a long product name with an ellipsis inside a narrow header, keeping the menu button in it", async () => {
    await renderAsync(t => {
      t.name.set("A product whose name is far too long for the header");
      t.downloadHref.set(null);
    });
    header().style.width = "12rem";
    fixture.detectChanges();

    AppearanceFixture.expectTruncates(part(".nol-site-lockup-name"));
    expect(box(".nol-site-menu-button").right).toBeLessThanOrEqual(edges().right);
  });

  it("moves Download into the open menu on a phone for a documentation site, a menu row high across the content", async () => {
    await phoneAsync();
    await renderAsync(t => t.wide.set(true));
    const closed = shown(".nol-site-download");

    await openAsync();
    const inset = AppearanceFixture.measureLook("site-padding-inline-phone");

    expect(closed).toBe(false);
    AppearanceFixture.expectPixels(box(".nol-site-download").left, edges().left + inset);
    AppearanceFixture.expectPixels(box(".nol-site-download").width, edges().width - inset * 2);
    AppearanceFixture.expectPixels(box(".nol-site-download").height, AppearanceFixture.measureLook("site-menu-row"));
    AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(part(".nol-site-download")).fontSize), AppearanceFixture.measureLook("site-menu-download-text"));
    AppearanceFixture.expectPixels(box(".nol-site-download-icon").width, AppearanceFixture.measureLook("site-download-glyph-phone"));
    AppearanceFixture.expectPixels(box(".nol-site-download").top - box(".nol-site-header-tools").bottom, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(edges().bottom - box(".nol-site-download").bottom, AppearanceFixture.measureLook("space-4"));
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws the wordmark and the social icons in LinkText and underlines the current link under forced colors in ${mode} mode`, async () => {
      await renderAsync(() => undefined, AppearanceFixture.themes[0], mode);
      await ForcedColorsFixture.activateAsync();
      const link = ForcedColorsFixture.resolve("LinkText");

      expect([getComputedStyle(part(".nol-site-wordmark")).backgroundColor, getComputedStyle(part(".nol-site-social-icon")).backgroundColor,
        getComputedStyle(part(".nol-site-nav-link-current")).textDecorationLine]).toEqual([link, link, "underline"]);
    });
});
