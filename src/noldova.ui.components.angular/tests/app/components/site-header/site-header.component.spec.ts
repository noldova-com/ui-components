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
import { SiteLink } from "../../../../src/app/models/site-link";
import { SiteSocialLink } from "../../../../src/app/models/site-social-link";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

const wordmark = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 3'%3E%3Crect width='20' height='3'/%3E%3C/svg%3E";
const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1'/%3E%3C/svg%3E";

@Component({
  imports: [SiteHeaderComponent, SiteSearchDirective],
  template: `
    <nol-site-header [wordmark]="wordmark" [name]="name()" [version]="version()" [versionHref]="versionHref()" [links]="links()" [social]="social()"
      [downloadHref]="downloadHref()" [downloadLabel]="downloadLabel()" [wide]="wide()" [contentId]="contentId()" [(menuOpen)]="menuOpen">
      @if (hasSearch()) {
        <input nolSiteSearch type="search" aria-label="Search" />
      }
    </nol-site-header>
    <main id="main" tabindex="-1">Content</main>
  `
})
class SiteHeaderHostComponent {
  public readonly wordmark: string = wordmark;
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
  const shown = (selector: string): boolean => getComputedStyle(part(selector)).display !== "none";
  const edges = (): DOMRect => header().getBoundingClientRect();
  const content = (): { left: number; right: number } => {
    const outer = bar().getBoundingClientRect();
    const style = getComputedStyle(bar());
    return { left: outer.left + Number.parseFloat(style.paddingLeft), right: outer.right - Number.parseFloat(style.paddingRight) };
  };

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
    await page.viewport(viewport.width, viewport.height);
    document.documentElement.removeAttribute("data-nol-theme-mode");
  });

  it("is the page's banner, sticky at the top on the window color, with no border", async () => {
    await renderAsync();
    const style = getComputedStyle(header());

    expect([header().getAttribute("role"), style.position, style.top, style.borderBottomWidth, getComputedStyle(bar()).borderBottomWidth, style.backgroundColor])
      .toEqual(["banner", "sticky", "0px", "0px", "0px", AppearanceFixture.readColor(AppearanceFixture.themes[0], AppearanceFixture.modes[0], "window")]);
  });

  it("links the lockup home, named for Noldova and the product, its wordmark a mask at the wordmark height and the wordmark's proportions", async () => {
    await renderAsync();
    const link = DomFixture.oneOf(header(), ".nol-site-lockup-link", HTMLAnchorElement);
    const mark = part(".nol-site-wordmark");
    const size = mark.getBoundingClientRect();

    expect([link.getAttribute("href"), link.getAttribute("aria-label"), part(".nol-site-lockup-name").textContent?.trim(), getComputedStyle(mark).maskImage.includes("data:image/svg+xml")])
      .toEqual(["/", "Noldova TeamRun", "TeamRun", true]);
    AppearanceFixture.expectPixels(size.height, AppearanceFixture.measureLook("site-wordmark"));
    expect(size.width / size.height).toBeCloseTo(1333.817 / 201.396, 1);
  });

  for (const name of [null, " "])
    it(`names the lockup Noldova alone when the product name is ${JSON.stringify(name)}`, async () => {
      await renderAsync(t => t.name.set(name));

      expect(part(".nol-site-lockup-link").getAttribute("aria-label")).toBe("Noldova");
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

  it("draws the version in small muted text a space after the lockup", async () => {
    await renderAsync(t => t.version.set("v0.0.9"));
    const style = getComputedStyle(part(".nol-site-version"));

    expect(style.color).toBe(AppearanceFixture.readColor(AppearanceFixture.themes[0], AppearanceFixture.modes[0], "text-muted"));
    AppearanceFixture.expectLook(style.fontSize, AppearanceFixture.themes[0], "text-small", "font-size");
    AppearanceFixture.expectPixels(box(".nol-site-version").left - box("nol-site-lockup").right, AppearanceFixture.measureLook("space-2"));
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
    AppearanceFixture.expectPixels(box(".nol-site-download").right, content().right);
  });

  it("draws the current link strong and the others muted, each at least a pointer target high", async () => {
    await renderAsync();
    const [current, other] = all(".nol-site-nav-link").map(t => getComputedStyle(t));
    const colors = (key: string): string => AppearanceFixture.readColor(AppearanceFixture.themes[0], AppearanceFixture.modes[0], key);

    expect([current?.color, current?.fontWeight, other?.color]).toEqual([colors("text-strong"), "600", colors("text-muted")]);
    for (const link of all(".nol-site-nav-link"))
      expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("pointer-target") - 1 / 32);
  });

  it("fills a hovered link with the toolbar hover color", async () => {
    await renderAsync();
    const link = DomFixture.at(all(".nol-site-nav-link"), 1);
    link.setAttribute("data-nol-state", "Hover");

    expect(getComputedStyle(link).backgroundColor).not.toBe(getComputedStyle(DomFixture.at(all(".nol-site-nav-link"), 2)).backgroundColor);
    expect(getComputedStyle(link).color).toBe(AppearanceFixture.readColor(AppearanceFixture.themes[0], AppearanceFixture.modes[0], "text-strong"));
  });

  it("outlines a focused link in the accent color inside its edge", async () => {
    await renderAsync();
    const link = DomFixture.at(all(".nol-site-nav-link"), 1);
    link.setAttribute("data-nol-state", "Focus");
    const style = getComputedStyle(link);

    expect([style.outlineStyle, style.outlineColor]).toEqual(["solid", AppearanceFixture.readColor(AppearanceFixture.themes[0], AppearanceFixture.modes[0], "accent")]);
    AppearanceFixture.expectPixels(Number.parseFloat(style.outlineOffset), -AppearanceFixture.measureLook("border-width"));
  });

  it("starts the links a gap after the lockup and puts the tools, then Download, at the bar's end, without a search", async () => {
    await renderAsync();
    const gap = AppearanceFixture.measureLook("space-6");

    expect(shown(".nol-site-header-search")).toBe(false);
    AppearanceFixture.expectPixels(box(".nol-site-header-brand").left, content().left);
    AppearanceFixture.expectPixels(box(".nol-site-header-nav").left - box(".nol-site-header-brand").right, gap);
    AppearanceFixture.expectPixels(box(".nol-site-download").right, content().right);
    AppearanceFixture.expectPixels(box(".nol-site-download").left - box(".nol-site-header-tools").right, gap);
  });

  it("draws a projected search at the search width before the tools", async () => {
    await renderAsync(t => t.hasSearch.set(true));
    const search = box(".nol-site-header-search");

    AppearanceFixture.expectPixels(search.width, AppearanceFixture.measureLook("site-search-width"));
    AppearanceFixture.expectPixels(box(".nol-site-header-tools").left - search.right, AppearanceFixture.measureLook("space-6"));
    expect(search.left).toBeGreaterThan(box(".nol-site-header-nav").right);
    AppearanceFixture.expectPixels(box(".nol-site-download").right, content().right);
  });

  it("draws each social link as an icon button named and tooltipped by its label, its icon a mask at the icon size", async () => {
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

  it("keeps the lockup, Download and a closed menu button on a phone, hiding the rest", async () => {
    await phoneAsync();
    await renderAsync(t => t.hasSearch.set(true));
    const panel = DomFixture.one(document, `#${menuButton().getAttribute("aria-controls")}`);

    expect([menuButton().getAttribute("aria-expanded"), menuButton().getAttribute("aria-label"), panel.classList.contains("nol-site-header-panel")]).toEqual(["false", "Menu", true]);
    expect([".nol-site-header-search", ".nol-site-header-nav", ".nol-site-header-tools"].map(shown)).toEqual([false, false, false]);
    AppearanceFixture.expectPixels(bar().getBoundingClientRect().height, AppearanceFixture.measureLook("site-header-height"));
    AppearanceFixture.expectPixels(box(".nol-site-menu-button").right, edges().right - AppearanceFixture.measureLook("site-padding-inline-phone"));
    AppearanceFixture.expectPixels(box(".nol-site-header-brand").left, edges().left + AppearanceFixture.measureLook("site-padding-inline-phone"));
    AppearanceFixture.expectPixels(box(".nol-site-menu-button").left - box(".nol-site-download").right, AppearanceFixture.measureLook("space-2"));
  });

  it("opens the search, the links in rows and the tools under the bar on a phone, the theme switch at the end", async () => {
    await phoneAsync();
    await renderAsync(t => t.hasSearch.set(true));
    await openAsync();
    const inset = AppearanceFixture.measureLook("site-padding-inline-phone");
    const rows = all(".nol-site-nav-link").map(t => t.getBoundingClientRect());
    const rowHeight = AppearanceFixture.measureLook("site-menu-row");

    expect([menuButton().getAttribute("aria-expanded"), menuButton().textContent?.trim()]).toEqual(["true", "close"]);
    AppearanceFixture.expectPixels(box(".nol-site-header-search").top, bar().getBoundingClientRect().top + AppearanceFixture.measureLook("site-header-height"));
    AppearanceFixture.expectPixels(box(".nol-site-header-search").width, edges().width - inset * 2);
    for (const [index, row] of rows.entries()) {
      AppearanceFixture.expectPixels(row.height, rowHeight);
      AppearanceFixture.expectPixels(row.width, edges().width - inset * 2);
      AppearanceFixture.expectPixels(row.top, DomFixture.at(rows, 0).top + index * rowHeight);
    }
    AppearanceFixture.expectPixels(box(".nol-site-header-tools").top, DomFixture.at(rows, rows.length - 1).bottom);
    AppearanceFixture.expectPixels(box(".nol-site-social").left, edges().left + inset);
    AppearanceFixture.expectPixels(box("nol-site-theme-switch").right, edges().right - inset);
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

  it("moves Download into the open menu on a phone for a documentation site", async () => {
    await phoneAsync();
    await renderAsync(t => t.wide.set(true));
    const closed = shown(".nol-site-download");

    await openAsync();

    expect(closed).toBe(false);
    AppearanceFixture.expectPixels(box(".nol-site-download").left, edges().left + AppearanceFixture.measureLook("site-padding-inline-phone"));
    AppearanceFixture.expectPixels(box(".nol-site-download").top - box(".nol-site-header-tools").bottom, AppearanceFixture.measureLook("space-2"));
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
