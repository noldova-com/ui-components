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
import { Theme } from "../../../../src/app/models/theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { LayoutSettleFixture } from "../../../fixtures/layout-settle.fixture";
import { PointerTargetFixture } from "../../../fixtures/pointer-target.fixture";

const formatWordmark = (width: number, height: number): string =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}'/%3E%3C/svg%3E`;
const unreadable = "data:image/svg+xml,unreadable";
const darkIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2 2'%3E%3Crect width='2' height='2'/%3E%3C/svg%3E";
const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1'/%3E%3C/svg%3E";

@Component({
  imports: [SiteHeaderComponent, SiteSearchDirective],
  template: `
    <nol-site-header [wordmark]="wordmark()" [wordmarkRatio]="wordmarkRatio()" [icon]="productIcon()" [iconDark]="productIconDark()" [name]="name()" [version]="version()" [versionHref]="versionHref()" [links]="links()" [social]="social()"
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
  public readonly productIcon = signal<string | null>(null);
  public readonly productIconDark = signal<string | null>(null);
  public readonly name = signal<string | null>("Example");
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

// The width the lockup's whole name and the version need, and the room the bar leaves them beside the theme switch.
class NameRoom {
  public readonly needed: number;
  public readonly room: number;

  public constructor(needed: number, room: number) {
    this.needed = needed;
    this.room = room;
  }
}

// Renders a header with a product name after a wordmark in the Noldova wordmark's proportions, with a version and a search,
// and reads the room its bar leaves the name.
class SiteHeaderNames {
  // Product names short, long and very long.
  public readonly names: readonly string[] = ["Kit", "Exampleware", "An example product with a very long name"];
  private readonly render: (change: (host: SiteHeaderHostComponent) => void, theme: Theme, mode: ThemeMode) => Promise<void>;
  private readonly header: () => HTMLElement;

  public constructor(render: (change: (host: SiteHeaderHostComponent) => void, theme: Theme, mode: ThemeMode) => Promise<void>, header: () => HTMLElement) {
    this.render = render;
    this.header = header;
  }

  public async renderAsync(name: string, wide: boolean, mode: ThemeMode): Promise<void> {
    await this.render(t => {
      t.wordmark.set(formatWordmark(1333.817, 201.396));
      t.wordmarkRatio.set(1333.817 / 201.396);
      t.name.set(name);
      t.version.set("v0.0.1");
      t.hasSearch.set(true);
      t.wide.set(wide);
    }, DefaultTheme.theme, mode);
  }

  // The room beside a theme switch as wide as the bar draws it, measured from the switch where the bar shows it, and from
  // where it would go where not.
  public room(switchWidth: number): NameRoom {
    const gap = AppearanceFixture.measureLook("site-actions-gap-phone");
    const name = this.box(".nol-site-lockup-name");
    const text = document.createRange();
    text.selectNodeContents(DomFixture.one(this.header(), ".nol-site-lockup-name"));
    const needed = this.box("nol-site-lockup").width - name.width + text.getBoundingClientRect().width
      + Number.parseFloat(getComputedStyle(DomFixture.one(this.header(), ".nol-site-header-brand")).columnGap) + this.box(".nol-site-version").width;
    const next = Math.min(...[".nol-site-download", ".nol-site-search-button", ".nol-site-menu-button"].filter(t => this.shown(t)).map(t => this.box(t).left));
    const end = this.shown("nol-site-theme-switch") ? this.box("nol-site-theme-switch").left : next - gap - switchWidth;

    return new NameRoom(needed, end - gap - this.box(".nol-site-header-brand").left);
  }

  // Waits for the header's observer's first reading, which a new observer of the same element gets after it.
  public observedAsync(): Promise<void> {
    return new Promise(resolve => {
      const observer = new ResizeObserver(() => {
        observer.disconnect();
        resolve();
      });
      observer.observe(DomFixture.one(this.header(), ".nol-site-header-width"));
    });
  }

  // Declares a face of each family from the kit's own font file, drawn four times its size, so a name in it is far wider than
  // in any fallback, and returns the style that declares them.
  public addWideFaces(families: readonly string[]): HTMLStyleElement {
    const sources = [...document.styleSheets].flatMap(sheet => [...sheet.cssRules]
      .filter(t => t instanceof CSSFontFaceRule)
      .flatMap(t => [...t.style.getPropertyValue("src").matchAll(/url\("([^"]*)"\)/gu)].map(u => new URL(DomFixture.at(u, 1), sheet.href ?? document.baseURI).href)));
    const style = document.createElement("style");
    style.textContent = families.map(t => `@font-face { font-family: "${t}"; src: url("${DomFixture.at(sources, 0)}"); size-adjust: 400%; }`).join("\n");
    document.head.append(style);
    return style;
  }

  private box(selector: string): DOMRect {
    return DomFixture.one(this.header(), selector).getBoundingClientRect();
  }

  private shown(selector: string): boolean {
    return getComputedStyle(DomFixture.one(this.header(), selector)).display !== "none";
  }
}

class SearchCloseCase {
  public readonly title: string;
  public readonly closeAsync: () => Promise<void>;

  public constructor(title: string, closeAsync: () => Promise<void>) {
    this.title = title;
    this.closeAsync = closeAsync;
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

  async function narrowAsync(): Promise<void> {
    await page.viewport(600, 812);
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

  it("is the page's banner, sticky at the top on the window color, with no border", async () => {
    await renderAsync();
    const style = getComputedStyle(header());

    expect([header().getAttribute("role"), style.position, style.top, style.borderBottomWidth, getComputedStyle(bar()).borderBottomWidth, style.backgroundColor])
      .toEqual(["banner", "sticky", "0px", "0px", "0px", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "window")]);
  });

  it("links the lockup home, named for the product's home, its wordmark a mask at the wordmark height and the wordmark's proportions", async () => {
    await renderAsync();
    const link = DomFixture.oneOf(header(), ".nol-site-lockup-link", HTMLAnchorElement);
    const mark = part(".nol-site-wordmark");
    const size = mark.getBoundingClientRect();

    expect([link.getAttribute("href"), link.getAttribute("aria-label"), part(".nol-site-lockup-name").textContent?.trim(), getComputedStyle(mark).maskImage.includes("data:image/svg+xml")])
      .toEqual(["/", "Example home", "Example", true]);
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

  it("names the lockup link by the product it is given, such as Example home, as its accessible name", async () => {
    await renderAsync(t => t.name.set("Example"));
    const link = DomFixture.oneOf(header(), ".nol-site-lockup-link", HTMLAnchorElement);

    expect([link.getAttribute("aria-label"), page.getByRole("link", { name: "Example home", exact: true }).elements().includes(link)]).toEqual(["Example home", true]);
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

  it("draws the current link strong and the others in the text color, at the site's link size on the site's line, each at least a pointer target high", async () => {
    await renderAsync();
    const [current, other] = all(".nol-site-nav-link").map(t => getComputedStyle(t));
    const colors = (key: string): string => AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, key);

    expect([current?.color, current?.fontWeight, other?.color]).toEqual([colors("text-strong"), "500", colors("text")]);
    AppearanceFixture.expectPixels(Number.parseFloat(other?.fontSize ?? ""), AppearanceFixture.measureLook("site-nav-text"));
    AppearanceFixture.expectPixels(Number.parseFloat(other?.lineHeight ?? ""), AppearanceFixture.measureLook("site-nav-text") * Number.parseFloat(DefaultTheme.theme.readLook("site-line-height") ?? String.empty));
    for (const link of all(".nol-site-nav-link"))
      expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("pointer-target") - 1 / 32);
  });

  it("underlines a hovered link in the strong text color, with no fill", async () => {
    await renderAsync();
    const link = DomFixture.at(all(".nol-site-nav-link"), 1);
    link.setAttribute("data-nol-state", "Hover");
    const style = getComputedStyle(link);

    expect([style.color, style.textDecorationLine, style.backgroundColor])
      .toEqual([AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "text-strong"), "underline", getComputedStyle(DomFixture.at(all(".nol-site-nav-link"), 2)).backgroundColor]);
  });

  it("outlines a focused link in the accent color just outside its edge", async () => {
    await renderAsync();
    const link = DomFixture.at(all(".nol-site-nav-link"), 1);
    link.setAttribute("data-nol-state", "Focus");
    const style = getComputedStyle(link);

    expect([style.outlineStyle, style.outlineColor]).toEqual(["solid", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent")]);
    AppearanceFixture.expectPixels(Number.parseFloat(style.outlineOffset), AppearanceFixture.measureLook("border-width"));
  });

  it("centres the links between the lockup and the actions, a link gap apart, and puts the theme switch, the social links, then Download, an actions gap apart, at the bar's end, without a search", async () => {
    await page.viewport(1280, 800);
    await renderAsync();
    const links = all(".nol-site-nav-link").map(t => t.getBoundingClientRect());
    const socials = all(".nol-site-social").map(t => t.getBoundingClientRect());
    const gap = AppearanceFixture.measureLook("site-actions-gap");
    const first = DomFixture.at(links, 0);
    const last = DomFixture.at(links, links.length - 1);

    expect(shown(".nol-site-header-search")).toBe(false);
    AppearanceFixture.expectPixels(box(".nol-site-header-brand").left, contentLeft());
    AppearanceFixture.expectPixels(first.left - box(".nol-site-header-brand").right, box("nol-site-theme-switch").left - last.right);
    AppearanceFixture.expectPixels(DomFixture.at(links, 1).left - first.right, AppearanceFixture.measureLook("site-nav-gap"));
    AppearanceFixture.expectPixels(DomFixture.at(socials, 0).left - box("nol-site-theme-switch").right, gap);
    AppearanceFixture.expectPixels(DomFixture.at(socials, 1).left - DomFixture.at(socials, 0).right, gap);
    AppearanceFixture.expectPixels(box(".nol-site-download").left - DomFixture.at(socials, 1).right, gap);
    AppearanceFixture.expectPixels(box(".nol-site-download").right, contentRight());
  });

  it("draws the links closer and the actions without the social links on a tablet window", async () => {
    await page.viewport(900, 800);
    await renderAsync();
    const links = all(".nol-site-nav-link").map(t => t.getBoundingClientRect());

    expect(shown(".nol-site-header-social")).toBe(false);
    AppearanceFixture.expectPixels(DomFixture.at(links, 1).left - DomFixture.at(links, 0).right, AppearanceFixture.measureLook("site-nav-gap-tablet"));
    AppearanceFixture.expectPixels(box(".nol-site-download").left - box("nol-site-theme-switch").right, AppearanceFixture.measureLook("site-actions-gap-tablet"));
    AppearanceFixture.expectPixels(box(".nol-site-download").right, contentRight());
  });

  it("draws a projected search at the search width before the actions", async () => {
    await page.viewport(1280, 800);
    await renderAsync(t => t.hasSearch.set(true));
    const search = box(".nol-site-header-search");

    AppearanceFixture.expectPixels(search.width, AppearanceFixture.measureLook("site-search-width"));
    AppearanceFixture.expectPixels(box("nol-site-theme-switch").left - search.right, AppearanceFixture.measureLook("site-actions-gap"));
    expect(search.left).toBeGreaterThan(box(".nol-site-header-nav").right);
    AppearanceFixture.expectPixels(box(".nol-site-download").right, contentRight());
  });

  it("draws no icon, and no box for one, without the product's icon", async () => {
    await renderAsync();

    expect([maybe(".nol-site-lockup-icon"), box(".nol-site-wordmark").left - box(".nol-site-lockup-link").left]).toEqual([null, 0]);
  });

  for (const width of [1280, 600, 390])
    it(`draws the product's icon at the site icon size a space-3 step before the wordmark, centred on it, inside the lockup's link, on a ${width}px window`, async () => {
      await page.viewport(width, 800);
      await renderAsync(t => t.productIcon.set(icon));
      const mark = DomFixture.oneOf(header(), "img.nol-site-lockup-icon", HTMLImageElement);
      const glyph = mark.getBoundingClientRect();
      const word = box(".nol-site-wordmark");
      const link = box(".nol-site-lockup-link");
      const size = AppearanceFixture.measureLook("site-icon");

      AppearanceFixture.expectPixels(glyph.width, size);
      AppearanceFixture.expectPixels(glyph.height, size);
      AppearanceFixture.expectPixels(word.left - glyph.right, AppearanceFixture.measureLook("space-3"));
      AppearanceFixture.expectPixels(glyph.top + glyph.height / 2, word.top + word.height / 2);
      expect([mark.getAttribute("alt"), part(".nol-site-lockup-link").getAttribute("aria-label")]).toEqual(["", "Example home"]);
      expect([glyph.left >= link.left - 1 / 32, word.right <= link.right + 1 / 32]).toEqual([true, true]);
    });

  it("holds the icon's box before its file loads, so the wordmark doesn't move when it does", async () => {
    await renderAsync(t => t.productIcon.set(unreadable));
    const glyph = box(".nol-site-lockup-icon");

    AppearanceFixture.expectPixels(glyph.width, AppearanceFixture.measureLook("site-icon"));
    AppearanceFixture.expectPixels(box(".nol-site-wordmark").left - glyph.right, AppearanceFixture.measureLook("space-3"));
  });

  for (const mode of ["Light", "Dark"])
    it(`draws the ${mode === "Dark" ? "dark" : "light"} icon alone when the site passes both and the page is in ${mode} mode, and the one icon in either mode without a dark one`, async () => {
      await renderAsync(t => {
        t.productIcon.set(icon);
        t.productIconDark.set(darkIcon);
      });
      document.documentElement.setAttribute("data-nol-theme-mode", mode);
      const drawn = all(".nol-site-lockup-icon").filter(t => getComputedStyle(t).display !== "none").map(t => t.getAttribute("src"));
      fixture.destroy();
      await renderAsync(t => t.productIcon.set(icon));
      document.documentElement.setAttribute("data-nol-theme-mode", mode);
      const single = all(".nol-site-lockup-icon").filter(t => getComputedStyle(t).display !== "none").map(t => t.getAttribute("src"));

      expect([drawn, single]).toEqual([[mode === "Dark" ? darkIcon : icon], [icon]]);
    });

  it("keeps the lockup's icon and whole wordmark inside its link on a 390px window, with a long wordmark, the phone gap before the menu button and nothing in the bar overlapping, and the theme switch and Download in the open menu", async () => {
    await page.viewport(390, 800);
    await renderAsync(t => {
      t.productIcon.set(icon);
      t.wordmark.set(formatWordmark(26, 3));
      t.wordmarkRatio.set(26 / 3);
    });
    const link = box(".nol-site-lockup-link");
    const parts = [box(".nol-site-lockup-icon"), box(".nol-site-wordmark")];
    const bar = all(".nol-site-header-bar > *").filter(t => getComputedStyle(t).display !== "none" && t.getBoundingClientRect().width > 0).map(t => t.getBoundingClientRect());
    const overlaps = bar.flatMap((t, i) => bar.slice(i + 1).filter(u => t.left < u.right - 1 / 32 && u.left < t.right - 1 / 32 && t.top < u.bottom - 1 / 32 && u.top < t.bottom - 1 / 32));

    expect([parts.every(t => t.left >= link.left - 1 / 32 && t.right <= link.right + 1 / 32), overlaps.length, shown(".nol-site-download"), shown("nol-site-theme-switch")]).toEqual([true, 0, false, false]);
    expect(box(".nol-site-menu-button").left - box("nol-site-lockup").right).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("site-actions-gap-phone") - 1 / 32);
    AppearanceFixture.expectPixels(DomFixture.at(parts, 1).width, AppearanceFixture.measureLook("site-wordmark") * 26 / 3);
    await openAsync();

    expect([shown("nol-site-theme-switch"), shown(".nol-site-download"), box(".nol-site-download").top > box(".nol-site-header-social").bottom]).toEqual([true, true, true]);
  });

  it("narrows the wordmark, its icon whole, rather than running into Download when the bar is too tight for them, on a 520px window with Download in the bar, and draws the theme switch in the open menu under the links", async () => {
    await page.viewport(520, 800);
    await renderAsync(t => {
      t.productIcon.set(icon);
      t.wordmark.set(formatWordmark(24, 1));
      t.wordmarkRatio.set(24);
    });
    const link = box(".nol-site-lockup-link");
    const parts = [box(".nol-site-lockup-icon"), box(".nol-site-wordmark")];
    const wordmark = DomFixture.at(parts, 1);

    expect([shown(".nol-site-download"), parts.every(t => t.left >= link.left - 1 / 32 && t.right <= link.right + 1 / 32)]).toEqual([true, true]);
    expect(box(".nol-site-download").left - box("nol-site-lockup").right).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("site-actions-gap-phone") - 1 / 32);
    AppearanceFixture.expectPixels(DomFixture.at(parts, 0).width, AppearanceFixture.measureLook("site-icon"));
    AppearanceFixture.expectPixels(wordmark.height, AppearanceFixture.measureLook("site-wordmark"));
    expect(wordmark.width).toBeLessThan(AppearanceFixture.measureLook("site-wordmark") * 24 - 1);
    expect(getComputedStyle(part(".nol-site-wordmark")).maskSize).toBe("contain");
    expect(shown("nol-site-theme-switch")).toBe(false);
    await openAsync();

    expect(shown("nol-site-theme-switch")).toBe(true);
    AppearanceFixture.expectPixels(box("nol-site-theme-switch").top - DomFixture.at(all(".nol-site-nav-link").map(t => t.getBoundingClientRect()), 2).bottom, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(box("nol-site-theme-switch").left, edges().left + AppearanceFixture.measureLook("site-padding-inline-phone"));
  });

  it("draws each social link in the strong text color, named by its label with the label as its title, its box the theme pill size, its icon a mask at the header icon size", async () => {
    await page.viewport(1280, 800);
    await renderAsync();
    const links = all(".nol-site-social");
    const size = AppearanceFixture.measureLook("site-theme-pill");

    expect(links.map(t => [t.getAttribute("href"), t.getAttribute("aria-label"), t.getAttribute("title"), t.hasAttribute("aria-describedby")]))
      .toEqual([["#github", "GitHub", "GitHub", false], ["#x", "X", "X", false]]);
    for (const link of links) {
      const glyph = DomFixture.one(link, ".nol-site-social-icon");
      AppearanceFixture.expectPixels(link.getBoundingClientRect().width, size);
      AppearanceFixture.expectPixels(link.getBoundingClientRect().height, size);
      AppearanceFixture.expectPixels(glyph.getBoundingClientRect().width, AppearanceFixture.measureLook("site-header-icon"));
      expect(getComputedStyle(link).color).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "text-strong"));
      expect([glyph.getAttribute("aria-hidden"), getComputedStyle(glyph).maskImage.includes("data:image/svg+xml"), shown(".nol-site-social-label")]).toEqual(["true", true, false]);
    }
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws each social mark pure ${mode === ThemeMode.Dark ? "white" : "black"} in ${mode} mode in every theme, hovered and focused too, as GitHub's and X's terms allow`, async () => {
      const expected = mode === ThemeMode.Dark ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)";
      const drawn: string[] = [];
      for (const theme of AppearanceFixture.themes) {
        await renderAsync(() => undefined, theme, mode);
        for (const link of all(".nol-site-social"))
          for (const state of [null, "Hover", "Focus"]) {
            if (Object.isNull(state))
              link.removeAttribute("data-nol-state");
            else
              link.setAttribute("data-nol-state", state);
            drawn.push(getComputedStyle(DomFixture.one(link, ".nol-site-social-icon")).backgroundColor);
          }
        fixture.destroy();
      }

      expect(drawn).toEqual(drawn.map(() => expected));
    });

  it("makes every target in the bar at least the pointer target in both directions, the theme switch's pills boxes that hold their faces centred and don't cover each other, the switch centred on the social links", async () => {
    await page.viewport(1280, 800);
    await renderAsync(t => {
      t.version.set("v0.4.2");
      t.versionHref.set("#version");
    });

    PointerTargetFixture.expectTargets(header(), ["v0.4.2", "Features", "GitHub", "X", "Light", "Dark", "System", "Download"]);
    const pills = all("nol-site-theme-switch .nol-choice-pill");
    const size = AppearanceFixture.measureLook("site-theme-pill");
    const target = AppearanceFixture.measureLook("pointer-target");
    const centre = (rectangle: DOMRect): number => rectangle.top + rectangle.height / 2;

    for (const pill of pills) {
      const rectangle = pill.getBoundingClientRect();
      const padding = Number.parseFloat(getComputedStyle(pill).paddingTop);
      AppearanceFixture.expectPixels(rectangle.height, Math.max(size, target));
      AppearanceFixture.expectPixels(rectangle.height - padding * 2, size);
    }
    for (const [index, pill] of pills.slice(1).entries())
      expect(pill.getBoundingClientRect().left >= DomFixture.at(pills, index).getBoundingClientRect().right - 1 / 32).toBe(true);
    AppearanceFixture.expectPixels(centre(box("nol-site-theme-switch")), centre(box(".nol-site-social")));
    AppearanceFixture.expectPixels(centre(box(".nol-site-download")), centre(box(".nol-site-social")));
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws the phone's menu glyph in the text color, ${mode}`, async () => {
      await phoneAsync();
      await renderAsync(() => undefined, DefaultTheme.theme, mode);

      expect(getComputedStyle(part(".nol-site-menu-button")).color).toBe(AppearanceFixture.readColor(DefaultTheme.theme, mode, "text"));
    });

  it("makes every target in the open phone menu at least the pointer target in both directions", async () => {
    await phoneAsync();
    await renderAsync();
    await openAsync();

    PointerTargetFixture.expectTargets(header(), ["Menu", "Features", "GitHub", "X", "Light", "Dark", "System", "Download"]);
  });

  it("draws Download with its label, and no button without a link", async () => {
    await renderAsync(t => t.downloadLabel.set("Get Example"));
    const labelled = [part(".nol-site-download").getAttribute("href"), part(".nol-site-download").textContent?.replace("download", String.empty).trim()];
    host.downloadHref.set(null);
    fixture.detectChanges();

    expect([labelled, maybe(".nol-site-download")]).toEqual([["#download", "Get Example"], null]);
  });

  it("draws no Download for an empty link, and keeps the theme switch in the bar on a 520px window, as without one", async () => {
    await page.viewport(520, 800);
    await renderAsync(t => t.downloadHref.set(String.empty));

    expect([maybe(".nol-site-download"), shown("nol-site-theme-switch")]).toEqual([null, true]);
    AppearanceFixture.expectPixels(box(".nol-site-menu-button").left - box("nol-site-theme-switch").right, AppearanceFixture.measureLook("site-actions-gap-phone"));
  });

  for (const theme of AppearanceFixture.themes)
    it(`draws Download at the ${theme.id} theme's site download height and text size with the button's edge, its icon after its label, a space step on, as wide as its padding, label and edge`, async () => {
      await renderAsync(() => undefined, theme);
      const download = part(".nol-site-download");
      const style = getComputedStyle(download);
      const edge = download.getBoundingClientRect();
      const glyph = part(".nol-site-download-icon").getBoundingClientRect();
      const text = document.createRange();
      text.selectNodeContents(DomFixture.present(part(".nol-site-download-label").firstChild));

      const border = AppearanceFixture.measureLook("border-width");
      const padding = AppearanceFixture.measureLook("site-download-padding-inline");
      const label = text.getBoundingClientRect();

      expect([style.borderTopWidth, style.borderLeftWidth, style.borderRightWidth]).toEqual([`${border}px`, `${border}px`, `${border}px`]);
      AppearanceFixture.expectPixels(Number.parseFloat(style.fontSize), AppearanceFixture.measureLook("site-download-text"));
      AppearanceFixture.expectPixels(edge.height, AppearanceFixture.measureLook("site-download-height"));
      AppearanceFixture.expectPixels(glyph.left - label.right, AppearanceFixture.measureLook("space-2"));
      AppearanceFixture.expectPixels(label.left - edge.left, padding + border);
      AppearanceFixture.expectPixels(edge.right - glyph.right, padding + border);
      AppearanceFixture.expectPixels(edge.width, 2 * (padding + border) + glyph.right - label.left);
      AppearanceFixture.expectPixels(glyph.width, AppearanceFixture.measureLook("site-download-text") * 1.25);
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
      it(`takes its height, inset and content width, the inset outside the content, from the ${theme.id} theme in ${mode} mode`, async () => {
        await page.viewport(1920, 1000);
        await renderAsync(() => undefined, theme, mode);
        const style = getComputedStyle(bar());
        const width = AppearanceFixture.measureLook("site-content-width");

        AppearanceFixture.expectPixels(bar().getBoundingClientRect().height, AppearanceFixture.measureLook("site-header-height"));
        AppearanceFixture.expectLook(style.paddingLeft, theme, "site-padding-inline", "padding-left");
        AppearanceFixture.expectLook(style.paddingRight, theme, "site-padding-inline", "padding-right");
        AppearanceFixture.expectPixels(bar().getBoundingClientRect().width, width + Number.parseFloat(style.paddingLeft) * 2);
        AppearanceFixture.expectPixels(bar().getBoundingClientRect().left - edges().left, (edges().width - bar().getBoundingClientRect().width) / 2);
      });

  it("widens to the wide content width on a documentation site", async () => {
    await page.viewport(1920, 1000);
    await renderAsync(t => t.wide.set(true));

    const inset = Number.parseFloat(getComputedStyle(bar()).paddingLeft);

    AppearanceFixture.expectPixels(bar().getBoundingClientRect().width, Math.min(edges().width, AppearanceFixture.measureLook("site-content-width-wide") + inset * 2));
  });

  it("hides the menu button on a desktop window", async () => {
    await renderAsync();

    expect(shown(".nol-site-menu-button")).toBe(false);
  });

  for (const theme of AppearanceFixture.themes)
    it(`keeps the lockup, the theme switch, Download, a search button and a closed menu button, a phone actions gap apart, in a phone-high bar on a 600px window, hiding the rest, with the ${theme.id} theme`, async () => {
      await narrowAsync();
      await renderAsync(t => {
        t.hasSearch.set(true);
        t.name.set("Kit");
      }, theme);
      const panel = DomFixture.one(document, `#${menuButton().getAttribute("aria-controls")}`);
      const size = AppearanceFixture.measureLook("site-menu-button");
      const gap = AppearanceFixture.measureLook("site-actions-gap-phone");
      const inset = AppearanceFixture.measureLook("site-padding-inline-phone");
      const download = box(".nol-site-download");
      const label = document.createRange();
      label.selectNodeContents(DomFixture.present(part(".nol-site-download-label").firstChild));

      expect([menuButton().getAttribute("aria-expanded"), menuButton().getAttribute("aria-label"), panel.classList.contains("nol-site-header-panel")]).toEqual(["false", "Menu", true]);
      expect([".nol-site-header-search", ".nol-site-header-nav", ".nol-site-header-social", "nol-site-theme-switch", ".nol-site-download"].map(shown)).toEqual([false, false, false, true, true]);
      AppearanceFixture.expectPixels(bar().getBoundingClientRect().height, AppearanceFixture.measureLook("site-header-height-phone"));
      AppearanceFixture.expectPixels(box(".nol-site-menu-button").width, size);
      AppearanceFixture.expectPixels(box(".nol-site-menu-button").height, size);
      AppearanceFixture.expectPixels(DomFixture.one(menuButton(), ".nol-icon-button-glyph").getBoundingClientRect().width, AppearanceFixture.measureLook("site-menu-glyph"));
      AppearanceFixture.expectPixels(box(".nol-site-menu-button").right, edges().right - inset);
      AppearanceFixture.expectPixels(box(".nol-site-header-brand").left, edges().left + inset);
      AppearanceFixture.expectPixels(download.left - box("nol-site-theme-switch").right, gap);
      AppearanceFixture.expectPixels(box(".nol-site-search-button").left - download.right, gap);
      AppearanceFixture.expectPixels(box(".nol-site-menu-button").left - box(".nol-site-search-button").right, gap);
      AppearanceFixture.expectPixels(download.height, AppearanceFixture.measureLook("site-download-height"));
      expect(box(".nol-site-download-icon").left).toBeGreaterThan(label.getBoundingClientRect().right);
    });

  it("opens the links, then the theme switch at the menu row size, then the social links named by their labels, in rows under the bar on a phone, then Download across the content, without the search", async () => {
    await phoneAsync();
    await renderAsync(t => t.hasSearch.set(true));
    await openAsync();
    await userEvent.hover(part(".nol-site-header-brand"));
    const inset = AppearanceFixture.measureLook("site-padding-inline-phone");
    const links = all(".nol-site-nav-link").map(t => t.getBoundingClientRect());
    const socials = all(".nol-site-social").map(t => t.getBoundingClientRect());
    const rows = [...links, ...socials];
    const theme = box("nol-site-theme-switch");
    const rowHeight = AppearanceFixture.measureLook("site-menu-row");
    const colors = (key: string): string => AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, key);
    const [current, other] = all(".nol-site-nav-link").map(t => getComputedStyle(t));
    const social = getComputedStyle(DomFixture.at(all(".nol-site-social"), 0));

    expect([menuButton().getAttribute("aria-expanded"), menuButton().textContent?.trim()]).toEqual(["true", "close"]);
    expect([getComputedStyle(menuButton(), "::before").backgroundColor, current?.color, other?.color, social.color]).toEqual([colors("selected"), colors("text-strong"), colors("text"), colors("text")]);
    expect(all(".nol-site-social-label").map(t => [t.textContent?.trim(), t.getAttribute("aria-hidden"), t.getBoundingClientRect().width > 0])).toEqual([["GitHub", "true", true], ["X", "true", true]]);
    AppearanceFixture.expectPixels(Number.parseFloat(other?.fontSize ?? String.empty), AppearanceFixture.measureLook("site-menu-text"));
    AppearanceFixture.expectPixels(Number.parseFloat(social.fontSize), AppearanceFixture.measureLook("site-menu-text"));
    expect([shown(".nol-site-header-search"), shown("nol-site-theme-switch")]).toEqual([false, true]);
    AppearanceFixture.expectPixels(DomFixture.at(rows, 0).top - bar().getBoundingClientRect().top, AppearanceFixture.measureLook("site-header-height-phone"));
    for (const row of rows) {
      AppearanceFixture.expectPixels(row.height, rowHeight);
      AppearanceFixture.expectPixels(row.left, edges().left + inset);
      AppearanceFixture.expectPixels(row.width, edges().width - inset * 2);
    }
    for (const [index, row] of links.entries())
      AppearanceFixture.expectPixels(row.top, DomFixture.at(links, 0).top + index * rowHeight);
    for (const [index, row] of socials.entries())
      AppearanceFixture.expectPixels(row.top, theme.bottom + index * rowHeight);
    AppearanceFixture.expectPixels(theme.top - DomFixture.at(links, links.length - 1).bottom, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(theme.left, edges().left + inset);
    AppearanceFixture.expectPixels(pill().getBoundingClientRect().height, rowHeight);
    AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(DomFixture.one(pill(), ".nol-choice-pill-glyph")).fontSize), AppearanceFixture.measureLook("site-menu-icon"));
    AppearanceFixture.expectPixels(box(".nol-site-social-icon").width, AppearanceFixture.measureLook("site-menu-icon"));
    AppearanceFixture.expectPixels(box(".nol-site-social-label").left - box(".nol-site-social-icon").right, AppearanceFixture.measureLook("space-2"));
    AppearanceFixture.expectPixels(box(".nol-site-download").top - DomFixture.at(rows, rows.length - 1).bottom, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(box(".nol-site-download").width, edges().width - inset * 2);
    AppearanceFixture.expectPixels(edges().bottom - box(".nol-site-download").bottom, AppearanceFixture.measureLook("space-6"));
  });

  it("makes Download, the search button and the menu button take taps at least a menu row tall and wide on a 600px window, and draws nothing there", async () => {
    await narrowAsync();
    await renderAsync(t => t.hasSearch.set(true));
    const reach = AppearanceFixture.measureLook("site-menu-row") / 2 - 1;
    const taken = [".nol-site-download", ".nol-site-search-button", ".nol-site-menu-button"].map(selector => {
      const control = part(selector);
      const edge = control.getBoundingClientRect();
      const x = edge.left + edge.width / 2;
      const y = edge.top + edge.height / 2;
      const after = getComputedStyle(control, "::after");
      const left = edge.left + Math.min(0, edge.width / 2 - reach);
      const right = edge.right - Math.min(0, edge.width / 2 - reach);
      return [[x, y - reach], [x, y + reach], [left + 1, y], [right - 1, y]].map(([u = 0, v = 0]) => control.contains(document.elementFromPoint(u, v)))
        .concat(after.backgroundColor === "rgba(0, 0, 0, 0)");
    });

    expect(taken).toEqual(taken.map(() => [true, true, true, true, true]));
  });

  it("hides the search button on a desktop window and on a 600px window without a search", async () => {
    await renderAsync(t => t.hasSearch.set(true));
    const desktop = shown(".nol-site-search-button");
    await narrowAsync();
    host.hasSearch.set(false);
    fixture.detectChanges();

    expect([desktop, shown(".nol-site-search-button")]).toEqual([false, false]);
    AppearanceFixture.expectPixels(box(".nol-site-menu-button").left - box(".nol-site-download").right, AppearanceFixture.measureLook("site-actions-gap-phone"));
  });

  for (const theme of AppearanceFixture.themes)
    it(`puts a search button the menu button's size before it, a phone actions gap apart, on a phone for a documentation site, with the ${theme.id} theme`, async () => {
      await phoneAsync();
      await renderAsync(t => {
        t.hasSearch.set(true);
        t.wide.set(true);
      }, theme);
      const size = AppearanceFixture.measureLook("site-menu-button");
      const button = box(".nol-site-search-button");

      expect([searchButton().getAttribute("aria-label"), searchButton().getAttribute("aria-expanded"), searchButton().getAttribute("aria-controls"), searchButton().textContent?.trim()])
        .toEqual(["Search", "false", part(".nol-site-header-search").id, "search"]);
      expect([shown(".nol-site-header-search"), shown(".nol-site-download")]).toEqual([false, false]);
      AppearanceFixture.expectPixels(button.width, size);
      AppearanceFixture.expectPixels(button.height, size);
      AppearanceFixture.expectPixels(DomFixture.one(searchButton(), ".nol-icon-button-glyph").getBoundingClientRect().width, AppearanceFixture.measureLook("site-menu-glyph"));
      AppearanceFixture.expectPixels(button.top, bar().getBoundingClientRect().top + (AppearanceFixture.measureLook("site-header-height-phone") - size) / 2);
      AppearanceFixture.expectPixels(box(".nol-site-menu-button").left - button.right, AppearanceFixture.measureLook("site-actions-gap-phone"));
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
    AppearanceFixture.expectPixels(search.top, bar().getBoundingClientRect().top + AppearanceFixture.measureLook("site-header-height-phone"));
    AppearanceFixture.expectPixels(search.left, edges().left + inset);
    AppearanceFixture.expectPixels(search.width, edges().width - inset * 2);
    AppearanceFixture.expectPixels(edges().bottom - search.bottom, AppearanceFixture.measureLook("space-6"));
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

  it("moves the focus to the first link when the menu opens on a phone, and Tab goes on through the links, the theme switch, the social links, then Download", async () => {
    await phoneAsync();
    await renderAsync(t => {
      t.hasSearch.set(true);
      t.wide.set(true);
    });
    await openAsync();

    const expected = [...all(".nol-site-nav-link"), pill(), ...all(".nol-site-social"), part(".nol-site-download")];

    expect(await tabsAsync(expected)).toEqual(expected.map((_, index) => index));
  });

  it("follows the bar in the order it is drawn with Tab on a desktop window: the lockup, the links, the search, the theme switch, the social links, then Download", async () => {
    await page.viewport(1280, 800);
    await renderAsync(t => t.hasSearch.set(true));
    DomFixture.oneOf(header(), ".nol-site-lockup-link", HTMLAnchorElement).focus();
    const drawn = [".nol-site-lockup-link", ".nol-site-nav-link", "input[nolSiteSearch]", "nol-site-theme-switch", ".nol-site-social", ".nol-site-download"]
      .map(t => DomFixture.all(header(), t).map(part => part.getBoundingClientRect().left))
      .flat();

    const expected = [part(".nol-site-lockup-link"), ...all(".nol-site-nav-link"), field(), pill(), ...all(".nol-site-social"), part(".nol-site-download")];

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
    part(".nol-site-lockup-link").focus();
    await userEvent.keyboard("{Escape}");

    expect([closed, document.activeElement === part(".nol-site-lockup-link")]).toEqual([["false", true, false], true]);
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

    expect([menuButton().getAttribute("aria-expanded"), shown(".nol-site-header-social")]).toEqual(["false", false]);
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

  const names = new SiteHeaderNames(renderAsync, header);
  const compact = "nol-site-header-compact";
  const frameAsync = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()));

  for (const mode of AppearanceFixture.modes)
    for (const wide of [true, false])
      it(`keeps the theme switch in the bar exactly when a short, a long or a very long name and its version fit beside it, and otherwise draws it in the menu, the name whole where it fits there and cut with an ellipsis where not, on a phone ${wide ? "for a documentation site" : "with Download"}, in ${mode} mode`, async () => {
        await page.viewport(1280, 812);
        await names.renderAsync(DomFixture.at(names.names, 0), wide, mode);
        const switchWidth = box("nol-site-theme-switch").width;
        fixture.destroy();
        const read: string[][] = [];
        for (const name of names.names)
          for (const width of [360, 375, 430, 480, 600]) {
            await page.viewport(width, 812);
            await names.renderAsync(name, wide, mode);
            const { needed, room } = names.room(switchWidth);
            const label = part(".nol-site-lockup-name");
            const parts = all(".nol-site-header-bar > *").filter(t => getComputedStyle(t).display !== "none" && t.getBoundingClientRect().width > 0).map(t => t.getBoundingClientRect());
            const overlaps = parts.flatMap((t, i) => parts.slice(i + 1).filter(u => t.left < u.right - 1 / 32 && u.left < t.right - 1 / 32 && t.top < u.bottom - 1 / 32 && u.top < t.bottom - 1 / 32));
            const inBar = shown("nol-site-theme-switch");
            const whole = label.scrollWidth <= label.clientWidth;
            const fitsWithout = needed <= room + switchWidth + AppearanceFixture.measureLook("site-actions-gap-phone") + 1 / 32;
            read.push([`${name} at ${width}px`, inBar === needed <= room + 1 / 32 ? "switch placed" : `switch ${inBar ? "in the bar" : "in the menu"} for ${needed} of ${room}`,
              whole === (inBar || fitsWithout) ? "name drawn" : `name ${whole ? "whole" : "cut"}`, overlaps.length === 0 ? "apart" : "overlapping"]);
            fixture.destroy();
          }
        const placed = read.map(t => [DomFixture.at(t, 0), "switch placed", "name drawn", "apart"]);

        expect(read).toEqual(placed);
        expect(names.names.map(t => read.filter(u => DomFixture.at(u, 0).startsWith(`${t} at`)).length)).toEqual([5, 5, 5]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`draws a short name with the theme switch in the bar at 430px and a very long one cut with an ellipsis, the switch in the menu, at 480px, in ${mode} mode`, async () => {
      await page.viewport(430, 812);
      await names.renderAsync(DomFixture.at(names.names, 0), true, mode);
      const short = [shown("nol-site-theme-switch"), header().classList.contains(compact)];
      fixture.destroy();
      await page.viewport(480, 812);
      await names.renderAsync(DomFixture.at(names.names, 2), true, mode);

      expect([short, [shown("nol-site-theme-switch"), header().classList.contains(compact)]]).toEqual([[true, false], [false, true]]);
      AppearanceFixture.expectTruncates(part(".nol-site-lockup-name"));
      await openAsync();

      expect(shown("nol-site-theme-switch")).toBe(true);
    });

  it("moves the theme switch into the menu once as the window narrows past where the name fits, keeps it there with the menu open, and moves it back once as the window widens", async () => {
    await page.viewport(600, 812);
    await names.renderAsync(DomFixture.at(names.names, 1), true, ThemeMode.Light);
    const states = [header().classList.contains(compact)];
    const changes = new MutationObserver(() => {
      const isCompact = header().classList.contains(compact);
      if (states.at(-1) !== isCompact)
        states.push(isCompact);
    });
    changes.observe(header(), { attributes: true, attributeFilter: ["class"] });
    const settledAsync = (what: string): Promise<void> => LayoutSettleFixture.settledAsync(what, () => `${states.join()} ${String(shown("nol-site-theme-switch"))}`, frameAsync);

    await page.viewport(375, 812);
    await DomChangeFixture.untilAsync(() => expect(shown("nol-site-theme-switch")).toBe(false));
    await settledAsync("the narrowed header");
    await openAsync();
    await settledAsync("the open menu");
    const opened = [shown("nol-site-theme-switch"), box("nol-site-theme-switch").top > bar().getBoundingClientRect().top + AppearanceFixture.measureLook("site-header-height-phone") - 1 / 32];
    await openAsync();
    await page.viewport(600, 812);
    await DomChangeFixture.untilAsync(() => expect(shown("nol-site-theme-switch")).toBe(true));
    await settledAsync("the widened header");
    changes.disconnect();

    expect([states, opened]).toEqual([[false, true, false], [true, true]]);
  });

  it("moves the theme switch between the bar and the open menu as the window crosses where the name fits, with no error on the page", async () => {
    await page.viewport(600, 812);
    await names.renderAsync(DomFixture.at(names.names, 1), true, ThemeMode.Light);
    const errors: string[] = [];
    const report = (event: ErrorEvent): void => {
      errors.push(event.message);
    };
    window.addEventListener("error", report);
    const settledAsync = (what: string): Promise<void> => LayoutSettleFixture.settledAsync(what, () => `${String(header().classList.contains(compact))} ${errors.length}`, frameAsync);
    await openAsync();

    await page.viewport(375, 812);
    await DomChangeFixture.untilAsync(() => expect(header().classList.contains(compact)).toBe(true));
    await settledAsync("the narrowed header");
    const narrowed = [shown("nol-site-theme-switch"), box("nol-site-theme-switch").top > bar().getBoundingClientRect().top + AppearanceFixture.measureLook("site-header-height-phone") - 1 / 32];
    await page.viewport(600, 812);
    await DomChangeFixture.untilAsync(() => expect(header().classList.contains(compact)).toBe(false));
    await settledAsync("the widened header");
    window.removeEventListener("error", report);

    expect([narrowed, errors]).toEqual([[true, true], []]);
  });

  it("measures again when Download's label changes, moving the theme switch into the menu for a label that leaves the name no room", async () => {
    await page.viewport(520, 812);
    await names.renderAsync(DomFixture.at(names.names, 0), false, ThemeMode.Light);
    await names.observedAsync();
    const before = [header().classList.contains(compact), shown("nol-site-theme-switch")];
    host.downloadLabel.set("Download the latest version for every computer you use");
    fixture.detectChanges();
    await DomChangeFixture.untilAsync(() => expect(header().classList.contains(compact)).toBe(true));

    expect([before, shown("nol-site-theme-switch")]).toEqual([[false, true], false]);
  });

  it("measures again when a font the name uses loads after the first reading, and not once the header is destroyed", async () => {
    await page.viewport(600, 812);
    await names.renderAsync(DomFixture.at(names.names, 1), true, ThemeMode.Light);
    await names.observedAsync();
    const before = header().classList.contains(compact);
    const faces = names.addWideFaces(["Example wide", "Example later"]);
    part(".nol-site-lockup-name").style.fontFamily = "'Example wide', sans-serif";
    await document.fonts.load("1rem 'Example wide'");
    await DomChangeFixture.untilAsync(() => expect(header().classList.contains(compact)).toBe(true));
    const element = header();
    fixture.destroy();
    element.classList.remove("nol-site-header-measured", compact);
    const loaded = new Promise(resolve => document.fonts.addEventListener("loadingdone", resolve, { once: true }));
    await document.fonts.load("1rem 'Example later'");
    await loaded;
    faces.remove();

    expect([before, element.classList.contains("nol-site-header-measured")]).toEqual([false, false]);
  });

  it("hides the theme switch in a phone's bar until the header has measured the name, as a prerendered page first paints, and draws it in the open menu", async () => {
    await phoneAsync();
    await renderAsync(t => t.name.set(DomFixture.at(names.names, 0)));
    await names.observedAsync();
    const measured = [header().classList.contains("nol-site-header-measured"), shown("nol-site-theme-switch")];
    header().classList.remove("nol-site-header-measured", compact);
    const unmeasured = shown("nol-site-theme-switch");
    await openAsync();

    expect([measured, unmeasured, shown("nol-site-theme-switch")]).toEqual([[true, true], false, true]);
    expect(box("nol-site-theme-switch").top).toBeGreaterThan(bar().getBoundingClientRect().top + AppearanceFixture.measureLook("site-header-height-phone") - 1 / 32);
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
    AppearanceFixture.expectPixels(box(".nol-site-download").top - box(".nol-site-header-social").bottom, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(edges().bottom - box(".nol-site-download").bottom, AppearanceFixture.measureLook("space-6"));
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
