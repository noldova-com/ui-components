/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { Router, provideRouter, withComponentInputBinding } from "@angular/router";
import { provideMarkdown } from "@noldova/ui.components.angular/markdown";
import { TooltipFixture } from "@noldova/ui.components.angular/testing";
import { userEvent } from "vitest/browser";

import { ForcedColorsFixture } from "../../../../../noldova.ui.components.angular/tests/fixtures/forced-colors.fixture.js";
import versionFile from "../../../../../../version.json";
import { routes } from "../../../../src/app/app.routes.js";
import { DocsShellComponent } from "../../../../src/app/components/docs-shell/docs-shell.component.js";
import { DocsFixture } from "../../../fixtures/docs.fixture.js";
import { DomChangeFixture } from "../../../../../noldova.ui.components.angular/tests/fixtures/dom-change.fixture.js";
import { EmulatedMediaFixture } from "../../../../../noldova.ui.components.angular/tests/fixtures/emulated-media.fixture.js";

class FrameLink {
  public readonly text: string | null;
  public readonly href: string | null;
  public readonly current: string | null;

  public constructor(text: string | null, href: string | null, current: string | null) {
    this.text = text;
    this.href = href;
    this.current = current;
  }
}

describe("DocsShellComponent", () => {
  const renderAsync = async (url: string): Promise<ComponentFixture<DocsShellComponent>> => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding()), provideMarkdown(), TooltipFixture.atOnce] });
    const fixture = TestBed.createComponent(DocsShellComponent);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    return fixture;
  };

  const heading = (fixture: ComponentFixture<DocsShellComponent>): string | undefined =>
    DocsFixture.host(fixture).querySelector("main h1")?.textContent?.trim();

  const topOf = (host: HTMLElement): number =>
    Math.max(...["nol-site-header", ".nol-docs-pages-bar"].map(t => DocsFixture.one(host, t).getBoundingClientRect()).filter(t => t.height > 0).map(t => t.bottom));

  const rootRem = (): number => Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

  const changelogLink = `https://github.com/noldova-com/ui-components/blob/main/CHANGELOG.md#${versionFile.version.replaceAll(".", "")}`;

  afterEach(() => DocsFixture.resetAsync());

  describe.each([
    ["Light", "light", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
    ["Dark", "dark", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
    ["Light", "light", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT],
    ["Dark", "dark", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT]
  ])("in the %s mode, a %s color scheme, at %ipx wide", (mode, scheme, width, height) => {
    it.each(["/", "/components/button"])("keeps %s inside the page's width", async url => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(width, height);
      const fixture = await renderAsync(url);
      const host = DocsFixture.host(fixture);
      await DomChangeFixture.untilAsync(() => expect(host.querySelectorAll("nol-code-block pre code").length).toBeGreaterThan(0));

      const edge = document.documentElement.clientWidth;

      expect(getComputedStyle(document.documentElement).colorScheme).toBe(scheme);
      expect(window.innerWidth).toBe(width);
      expect(DocsFixture.overflowWidth()).toBe(0);
      expect(DocsFixture.one(host, "nol-site-header").getBoundingClientRect().right).toBeLessThanOrEqual(edge);
      expect(DocsFixture.one(host, "main").getBoundingClientRect().right).toBeLessThanOrEqual(edge);
    });
  });

  describe.each([
    [DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT],
    [768, 1024],
    [1024, 768],
    [DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
    [1920, 1080],
    [2000, 1125]
  ])("at %ipx wide", (width, height) => {
    it.each(["/", "/tokens"])("fits every table on %s inside its section, with no table scrolling sideways", async url => {
      await DocsFixture.viewAsync(width, height);
      const host = DocsFixture.host(await renderAsync(url));
      await DomChangeFixture.untilAsync(() => expect(DocsFixture.all(host, ".nol-docs-stacked-table").filter(t => t.offsetWidth > (t.parentElement?.clientWidth ?? 0)).map(t => t.getAttribute("aria-label"))).toEqual([]));
      const tables = DocsFixture.all(host, "main table");

      expect(DocsFixture.overflowWidth()).toBe(0);
      expect(tables.filter(t => t.closest(".nol-docs-section") === null).length).toBe(0);
      expect(tables.flatMap(t => {
        const box = t.getBoundingClientRect();
        const owner = t.closest(".nol-docs-section")?.getBoundingClientRect() ?? box;
        return box.left < owner.left - 0.5 || box.right > owner.right + 0.5 ? [`${t.getAttribute("aria-label") ?? String()}: ${Math.round(box.width)} > ${Math.round(owner.width)}`] : [];
      })).toEqual([]);
    });
  });

  describe.each([
    ["Light", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT, 1.5],
    ["Dark", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT, 1.5],
    ["Light", 1920, 1080, 1.5],
    ["Light", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT, 1],
    ["Dark", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT, 1]
  ])("in the %s mode at %i by %i CSS pixels, the site's header and footer", (mode, width, height, inset) => {
    const renderSiteAsync = async (url: string): Promise<HTMLElement> => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(width, height);
      return DocsFixture.host(await renderAsync(url));
    };

    const contentStart = (): number => Math.max(0, (document.documentElement.clientWidth - 108 * rootRem()) / 2);

    const linksOf = (root: HTMLElement, selector: string): readonly FrameLink[] =>
      DocsFixture.all(root, selector).map(t => new FrameLink(t.textContent?.trim() ?? null, t.getAttribute("href"), t.getAttribute("aria-current")));

    it("are the kit's wide header and footer, with the UI Components lockup home, the kit's version, the search, GitHub and X, and no page links or Download", async () => {
      const host = await renderSiteAsync("/tokens");
      const header = DocsFixture.one(host, "nol-site-header");
      const footer = DocsFixture.one(host, "nol-site-footer");
      const version = DocsFixture.one(header, ".nol-site-version");

      expect([header.classList.contains("nol-site-header-wide"), footer.classList.contains("nol-site-footer-wide")]).toEqual([true, true]);
      expect([DocsFixture.one(header, ".nol-site-lockup-link").getAttribute("href"), DocsFixture.one(header, ".nol-site-lockup-name").textContent?.trim()]).toEqual(["/", "UI Components"]);
      expect([version.textContent?.trim(), version.getAttribute("href")]).toEqual([`v${versionFile.version}`, changelogLink]);
      expect(header.querySelectorAll(".nol-site-nav-link, .nol-site-download")).toHaveLength(0);
      expect(header.querySelectorAll(".nol-site-header-search nol-docs-search")).toHaveLength(1);
      expect(DocsFixture.all(header, ".nol-site-social").map(t => [t.getAttribute("aria-label"), t.getAttribute("href")]))
        .toEqual([["GitHub", "https://github.com/noldova-com/ui-components"], ["X", "https://x.com/noldova"]]);
      expect([DocsFixture.one(header, ".nol-site-skip").getAttribute("href"), DocsFixture.one(host, "main").id]).toEqual(["#nol-docs-main", "nol-docs-main"]);
      expect(DocsFixture.all(footer, ".nol-site-footer-group").map(t => [t.getAttribute("aria-label"), ...linksOf(t, "a").map(u => `${u.text} ${u.href}`)])).toEqual([
        ["UI Components", "Getting started /", "Theme tokens /tokens", "Changelog https://github.com/noldova-com/ui-components/blob/main/CHANGELOG.md"],
        ["Help", "Issues https://github.com/noldova-com/ui-components/issues", "Privacy https://noldova.com/privacy/"],
        ["Follow", "GitHub https://github.com/noldova-com/ui-components", "X https://x.com/noldova"]
      ]);
      expect(footer.querySelector(".nol-site-footer-line")).toBeNull();
    });

    it.each([["/", "Getting started"], ["/tokens", "Theme tokens"], ["/components/button", null]])("marks in the footer, on %s, %s as the current page", async (url, current) => {
      const host = await renderSiteAsync(url);

      expect(linksOf(DocsFixture.one(host, "nol-site-footer"), "a.nol-site-footer-link").filter(t => t.current === "page").map(t => t.text)).toEqual(Object.isNull(current) ? [] : [current]);
    });

    it("lays the header 3.5rem high across the window at its top, its wordmark at the site's inset inside 108rem and its parts centered on its line", async () => {
      const host = await renderSiteAsync("/");
      const unit = rootRem();
      const header = DocsFixture.one(host, "nol-site-header");
      const box = header.getBoundingClientRect();
      const edge = document.documentElement.clientWidth;
      const wordmark = DocsFixture.one(header, ".nol-site-header-bar .nol-site-wordmark").getBoundingClientRect();
      const end = DocsFixture.one(header, width === DocsFixture.PHONE_WIDTH ? ".nol-site-menu-button" : "nol-site-theme-switch").getBoundingClientRect();
      const middle = box.top + box.height / 2;

      expect(box.height / unit).toBeCloseTo(3.5, 2);
      expect([box.top, box.left, box.right]).toEqual([0, 0, edge]);
      expect((wordmark.left - contentStart()) / unit).toBeCloseTo(inset, 2);
      expect(Math.abs(wordmark.top + wordmark.height / 2 - middle) / unit).toBeLessThanOrEqual(0.05);
      expect(Math.abs(end.top + end.height / 2 - middle) / unit).toBeLessThanOrEqual(0.05);
      expect(end.right).toBeLessThanOrEqual(edge - contentStart());
      if (width !== DocsFixture.PHONE_WIDTH)
        expect((edge - contentStart() - end.right) / unit).toBeCloseTo(inset, 2);
      expect(DocsFixture.overflowWidth()).toBe(0);
    });

    it("puts the footer under the page across the window, its wordmark under the header's", async () => {
      const host = await renderSiteAsync("/components/button");
      await DomChangeFixture.untilAsync(() => expect(host.querySelectorAll("nol-code-block pre code").length).toBeGreaterThan(0));
      const unit = rootRem();
      const footer = DocsFixture.one(host, "nol-site-footer").getBoundingClientRect();
      const header = DocsFixture.one(host, "nol-site-header .nol-site-wordmark").getBoundingClientRect();
      const wordmark = DocsFixture.one(host, "nol-site-footer .nol-site-wordmark").getBoundingClientRect();

      expect(footer.top).toBeGreaterThanOrEqual(DocsFixture.one(host, ".nol-docs-body").getBoundingClientRect().bottom - 0.5);
      expect([footer.left, footer.right]).toEqual([0, document.documentElement.clientWidth]);
      expect(Math.abs(wordmark.left - header.left) / unit).toBeLessThanOrEqual(0.01);
      expect(wordmark.width / unit).toBeCloseTo(header.width / unit, 2);
    });
  });

  describe.each([
    ["Light", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
    ["Dark", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
    ["Light", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT],
    ["Dark", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT]
  ])("in the %s mode at %ipx wide, the docs search", (mode, width, height) => {
    const tokenColor = (inside: HTMLElement, name: string): string => {
      const probe = document.createElement("div");
      probe.style.backgroundColor = `var(--nol-${name})`;
      inside.append(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    };

    it("is the kit's quiet search field, with no visible border on the window fill, the search glyph centred at its start, the text the space-2 step after it, and the accent border while focused", async () => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(width, height);
      const host = DocsFixture.host(await renderAsync("/"));
      const header = DocsFixture.one(host, "nol-site-header");
      const field = DocsFixture.one(header, "input[type=search]");
      const glyph = DocsFixture.one(header, ".nol-docs-search-box > .nol-text-field-start");
      const unit = rootRem();
      const scale = 14 / 13;
      const resting = getComputedStyle(field);
      const look = [resting.borderTopColor, resting.borderLeftColor, resting.backgroundColor];

      await userEvent.click(width < DocsFixture.DESKTOP_WIDTH ? DocsFixture.one(header, ".nol-site-search-button") : field);
      await DomChangeFixture.untilAsync(() => expect(document.activeElement).toBe(field));
      const style = getComputedStyle(field);
      const box = field.getBoundingClientRect();
      const mark = glyph.getBoundingClientRect();
      const border = Number.parseFloat(style.borderLeftWidth);
      const textStart = box.left + border + Number.parseFloat(style.paddingLeft);

      expect(look).toEqual(["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0)", tokenColor(header, "window")]);
      expect([glyph.textContent?.trim(), glyph.getAttribute("aria-hidden"), field.getAttribute("aria-label")]).toEqual(["search", "true", "Search the docs"]);
      expect(style.borderTopColor).toBe(tokenColor(header, "accent"));
      expect(box.height / unit).toBeCloseTo(1.625 * scale, 2);
      expect((mark.left - box.left - border) / unit).toBeCloseTo(0.375 * scale, 2);
      expect((mark.top - box.top - (box.bottom - mark.bottom)) / unit).toBeCloseTo(0, 2);
      expect((textStart - mark.right) / unit).toBeCloseTo(0.5 * scale, 2);
    });
  });

  describe.each(["Light", "Dark"])("on a desktop in the %s mode, the site header", mode => {
    it("shows the docs search 16rem wide after the version and before GitHub, X and the theme, and reaches a page from it", async () => {
      DocsFixture.setMode(mode);
      const fixture = await renderAsync("/");
      const header = DocsFixture.one(DocsFixture.host(fixture), "nol-site-header");
      const unit = rootRem();
      const search = DocsFixture.one(header, "nol-docs-search").getBoundingClientRect();
      const version = DocsFixture.one(header, ".nol-site-version").getBoundingClientRect();
      const social = DocsFixture.one(header, ".nol-site-social").getBoundingClientRect();

      expect(search.width / unit).toBeCloseTo(16, 2);
      expect(search.left).toBeGreaterThanOrEqual(version.right);
      expect(social.left).toBeGreaterThanOrEqual(search.right);
      expect(DocsFixture.one(header, ".nol-site-search-button").getBoundingClientRect().width).toBe(0);

      await userEvent.fill(DocsFixture.one(header, "input[type=search]"), "variant");
      await userEvent.click(await DomChangeFixture.untilAsync(() => DocsFixture.byText(header, ".nol-docs-search-result", "Button")));

      await DomChangeFixture.untilAsync(() => expect(heading(fixture)).toBe("Button"));
    });

    it("saves the kit's theme choice under noldova-theme and applies it to the page", async () => {
      DocsFixture.setMode(mode);
      const other = mode === "Light" ? "Dark" : "Light";
      const header = DocsFixture.one(DocsFixture.host(await renderAsync("/")), "nol-site-header");

      await userEvent.click(DocsFixture.one(header, `nol-site-theme-switch [aria-label="${other}"]`));

      await DomChangeFixture.untilAsync(() => expect(document.documentElement.getAttribute(DocsFixture.MODE_ATTRIBUTE)).toBe(other));
      expect(localStorage.getItem(DocsFixture.STORAGE_KEY)).toBe(other.toLowerCase());
    });
  });

  it("follows the header's and footer's links to the site's own pages through the router, without a final slash, and leaves other sites' links, links within the page and modified clicks to the browser", async () => {
    const fixture = await renderAsync("/");
    const host = DocsFixture.host(fixture);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, "navigateByUrl");
    const clickOn = (target: Node, init: MouseEventInit): boolean => {
      const event = new MouseEvent("click", { bubbles: true, cancelable: true, ...init });
      window.addEventListener("click", t => t.preventDefault(), { once: true });
      target.dispatchEvent(event);
      return navigate.mock.calls.length > 0;
    };
    const tokens = (): HTMLElement => DocsFixture.byText(host, "nol-site-footer a", "Theme tokens");

    await userEvent.click(DocsFixture.byText(host, "nol-site-footer a", "Theme tokens"));
    await DocsFixture.routedAsync(router, "/tokens");
    expect(heading(fixture)).toBe("Theme tokens");
    await userEvent.click(DocsFixture.one(host, "nol-site-header .nol-site-lockup-link"));
    await DocsFixture.routedAsync(router, "/");
    navigate.mockClear();

    expect([
      clickOn(DocsFixture.byText(host, "nol-site-footer a", "Changelog"), {}),
      clickOn(tokens(), { ctrlKey: true }),
      clickOn(tokens(), { metaKey: true }),
      clickOn(tokens(), { shiftKey: true }),
      clickOn(tokens(), { altKey: true }),
      clickOn(tokens(), { button: 1 }),
      clickOn(DocsFixture.one(host, "nol-site-header .nol-site-skip"), {}),
      clickOn(DocsFixture.one(host, "nol-site-footer .nol-site-footer-group"), {}),
      clickOn(tokens().firstChild ?? tokens(), {})
    ]).toEqual([false, false, false, false, false, false, false, false, false]);

    tokens().addEventListener("click", t => t.preventDefault(), { once: true });
    expect(clickOn(tokens(), {})).toBe(false);
    tokens().setAttribute("target", "_blank");
    expect(clickOn(tokens(), {})).toBe(false);
    tokens().removeAttribute("target");

    const home = DocsFixture.one(host, "nol-site-header .nol-site-lockup-link");
    home.setAttribute("href", "/tokens/");
    await userEvent.click(home);
    await DocsFixture.routedAsync(router, "/tokens");
    expect(heading(fixture)).toBe("Theme tokens");
  });

  describe.each(["Light", "Dark"])("on a phone in the %s mode, the site header", mode => {
    const phoneAsync = async (): Promise<HTMLElement> => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT);
      return DocsFixture.host(await renderAsync("/tokens"));
    };

    it("takes turns with the pages menu, so only one of the two is open", async () => {
      const host = await phoneAsync();
      const header = DocsFixture.one(host, "nol-site-header");
      const siteButton = DocsFixture.one(header, ".nol-site-menu-button");
      const pagesButton = DocsFixture.one(host, "button.nol-docs-menu-button");

      await userEvent.click(pagesButton);
      await DomChangeFixture.untilAsync(() => expect(pagesButton.getAttribute("aria-expanded")).toBe("true"));

      await userEvent.click(siteButton);
      await DomChangeFixture.untilAsync(() => expect(siteButton.getAttribute("aria-expanded")).toBe("true"));

      expect(pagesButton.getAttribute("aria-expanded")).toBe("false");
      expect(getComputedStyle(DocsFixture.one(host, "#nol-docs-menu")).display).toBe("none");

      await userEvent.click(pagesButton);
      await DomChangeFixture.untilAsync(() => expect(pagesButton.getAttribute("aria-expanded")).toBe("true"));
      expect(siteButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("opens the docs search across the bar from its search button with the focus in its field, and closes it on reaching a page", async () => {
      const host = await phoneAsync();
      const unit = rootRem();
      const header = DocsFixture.one(host, "nol-site-header");
      const button = DocsFixture.one(header, ".nol-site-search-button");
      const field = DocsFixture.one(header, "input[type=search]");

      expect(field.getBoundingClientRect().width).toBe(0);
      await userEvent.click(button);
      await DomChangeFixture.untilAsync(() => expect(document.activeElement).toBe(field));
      const box = DocsFixture.one(header, "nol-docs-search").getBoundingClientRect();

      expect(box.left / unit).toBeCloseTo(1, 2);
      expect((document.documentElement.clientWidth - box.right) / unit).toBeCloseTo(1, 2);
      await userEvent.fill(field, "variant");
      await userEvent.click(await DomChangeFixture.untilAsync(() => DocsFixture.byText(header, ".nol-docs-search-result", "Button")));

      await DomChangeFixture.untilAsync(() => expect(button.getAttribute("aria-expanded")).toBe("false"));
      expect(DocsFixture.one(host, "main h1").textContent?.trim()).toBe("Button");
    });

    it("keeps the pages bar under the header's open menu on a scrolled page, in front of the page", async () => {
      const host = await phoneAsync();
      const header = DocsFixture.one(host, "nol-site-header");
      const bar = DocsFixture.one(host, ".nol-docs-pages-bar");
      window.scrollTo(0, document.documentElement.scrollHeight / 2);
      await DomChangeFixture.untilAsync(() => expect(window.scrollY).toBeGreaterThan(0));

      await userEvent.click(DocsFixture.one(header, ".nol-site-menu-button"));

      await DomChangeFixture.untilAsync(() => expect(Math.abs(bar.getBoundingClientRect().top - header.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0.5));
      const box = bar.getBoundingClientRect();
      expect(header.getBoundingClientRect().top).toBe(0);
      expect(bar.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))).toBe(true);
    });

    it("puts the pages bar right under the header, 3.5rem high, its button centered on it with its glyph at the site's 1rem inset", async () => {
      const host = await phoneAsync();
      const unit = rootRem();
      const bar = DocsFixture.one(host, ".nol-docs-pages-bar").getBoundingClientRect();
      const button = DocsFixture.one(host, "button.nol-docs-menu-button");
      const box = button.getBoundingClientRect();
      const icon = DocsFixture.one(button, "[nolButtonIcon]").getBoundingClientRect();

      expect(bar.top).toBe(DocsFixture.one(host, "nol-site-header").getBoundingClientRect().bottom);
      expect(bar.height / unit).toBeCloseTo(3.5, 2);
      expect(icon.left / unit).toBeCloseTo(1, 1);
      expect(button.textContent?.trim()).toContain("Pages");
      expect(Math.abs(box.top + box.height / 2 - (bar.top + bar.height / 2)) / unit).toBeLessThanOrEqual(0.05);
    });
  });

  it("puts the menu beside the page on a desktop, with no menu button, and behind a closed menu button on a phone", async () => {
    const fixture = await renderAsync("/");
    const host = DocsFixture.host(fixture);
    const menu = DocsFixture.one(host, "#nol-docs-menu");
    const main = DocsFixture.one(host, "main");
    const button = DocsFixture.one(host, "button.nol-docs-menu-button");

    expect(menu.getBoundingClientRect().right).toBeLessThanOrEqual(main.getBoundingClientRect().left);
    expect(getComputedStyle(DocsFixture.one(host, ".nol-docs-pages-bar")).display).toBe("none");
    expect(button.getBoundingClientRect().width).toBe(0);

    await DocsFixture.viewAsync(DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT);
    await DomChangeFixture.untilAsync(() => expect(getComputedStyle(menu).display).toBe("none"));
    expect(button.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe(menu.id);
  });

  describe.each([
    ["Light", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
    ["Dark", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
    ["Light", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT],
    ["Dark", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT]
  ])("in the %s mode at %ipx wide, while the page scrolls", (mode, width, height) => {
    const scrolledAsync = async (url: string): Promise<{ host: HTMLElement; header: HTMLElement; height: number }> => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(width, height);
      const host = DocsFixture.host(await renderAsync(url));
      const header = DocsFixture.one(host, "nol-site-header");
      await DomChangeFixture.untilAsync(() => expect(DocsFixture.one(host, "main").textContent).toContain("Default geometry"));
      const before = header.getBoundingClientRect().height;
      window.scrollTo(0, document.documentElement.scrollHeight / 2);
      await DomChangeFixture.untilAsync(() => expect(window.scrollY).toBeGreaterThan(before));
      return { host, header, height: before };
    };

    beforeEach(() => EmulatedMediaFixture.emulateAsync("prefers-reduced-transparency", "no-preference"));

    afterEach(async () => {
      window.scrollTo(0, 0);
      await EmulatedMediaFixture.resetAsync();
    });

    it("keeps the header at the top of the window, at its height and in front of the page, which shows through it blurred", async () => {
      const { header, height: before } = await scrolledAsync("/components/radio");
      await DomChangeFixture.untilAsync(() => expect(getComputedStyle(header).backgroundColor).toMatch(/ \/ 0\.92\)$/u));
      const box = header.getBoundingClientRect();

      expect(box.top).toBe(0);
      expect(box.height).toBeCloseTo(before, 1);
      expect(getComputedStyle(header).backdropFilter).toContain("blur(");
      expect(header.contains(document.elementFromPoint(box.left + box.width / 2, box.bottom - 1))).toBe(true);
      expect(header.contains(document.elementFromPoint(box.left + 1, box.top + 1))).toBe(true);
    });

    it("keeps the menu right below the header, in front of the page and in the window wherever the page is scrolled, scrolling on its own", async () => {
      const { host } = await scrolledAsync("/components/radio");
      const menu = DocsFixture.one(host, "#nol-docs-menu");
      if (width === DocsFixture.PHONE_WIDTH) {
        await userEvent.click(DocsFixture.one(host, "button.nol-docs-menu-button"));
        await DomChangeFixture.untilAsync(() => expect(menu.getBoundingClientRect().height).toBeGreaterThan(0));
      }
      const expectInView = (): void => {
        const box = menu.getBoundingClientRect();

        expect(Math.abs(box.top - topOf(host))).toBeLessThanOrEqual(0.5);
        expect(box.bottom).toBeLessThanOrEqual(window.innerHeight + 0.5);
        expect(menu.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))).toBe(true);
      };

      expectInView();
      const scrolled = window.scrollY;
      window.scrollTo(0, scrolled + window.innerHeight / 2);
      await DomChangeFixture.untilAsync(() => expect(window.scrollY).toBeGreaterThan(scrolled));
      expectInView();
      expect(menu.scrollHeight).toBeGreaterThan(menu.clientHeight);
      menu.scrollTop = menu.scrollHeight;
      expect(menu.scrollTop).toBeGreaterThan(0);
    });

    it("lands a heading an address names fully below the header", async () => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(width, height);
      const host = DocsFixture.host(await renderAsync("/components/radio#nol-docs-page-api"));
      const header = DocsFixture.one(host, "nol-site-header");
      const target = DocsFixture.one(host, "#nol-docs-page-api");

      await DomChangeFixture.untilAsync(() => {
        expect(window.scrollY).toBeGreaterThan(0);
        expect(Math.abs(target.getBoundingClientRect().top - topOf(host))).toBeLessThanOrEqual(1);
      });
      expect(header.getBoundingClientRect().top).toBe(0);
    });
  });

  it("sets the root's header height as it first renders, before a frame lets the header's size be observed", () => {
    const root = document.documentElement;
    root.style.removeProperty("--nol-docs-header-height");
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding()), provideMarkdown(), TooltipFixture.atOnce] });
    const fixture = TestBed.createComponent(DocsShellComponent);
    fixture.detectChanges();
    const host = DocsFixture.host(fixture);
    const height = DocsFixture.one(host, "nol-site-header").getBoundingClientRect().height + DocsFixture.one(host, ".nol-docs-pages-bar").getBoundingClientRect().height;

    expect(root.style.getPropertyValue("--nol-docs-header-height")).toBe(`${height}px`);
  });

  it("takes the header height off the root when it goes", async () => {
    const fixture = await renderAsync("/");
    const root = document.documentElement;
    await DomChangeFixture.untilAsync(() => expect(root.style.getPropertyValue("--nol-docs-header-height")).not.toBe(String()));

    fixture.destroy();

    expect(root.style.getPropertyValue("--nol-docs-header-height")).toBe(String());
  });

  describe("under forced colors", () => {
    afterEach(async () => {
      window.scrollTo(0, 0);
      await ForcedColorsFixture.resetAsync();
    });

    it("keeps the header at the top and in front of the page, filled with the window's ground", async () => {
      await ForcedColorsFixture.activateAsync();
      const host = DocsFixture.host(await renderAsync("/components/radio"));
      const header = DocsFixture.one(host, "nol-site-header");
      await DomChangeFixture.untilAsync(() => expect(DocsFixture.one(host, "main").textContent).toContain("Default geometry"));
      window.scrollTo(0, document.documentElement.scrollHeight / 2);
      await DomChangeFixture.untilAsync(() => expect(window.scrollY).toBeGreaterThan(0));
      const box = header.getBoundingClientRect();

      expect(box.top).toBe(0);
      expect(getComputedStyle(header).backgroundColor).toBe(ForcedColorsFixture.resolve("Canvas"));
      expect(header.contains(document.elementFromPoint(box.left + box.width / 2, box.bottom - 1))).toBe(true);
    });

    const expectCurrentMarkedAsync = async (nav: HTMLElement): Promise<void> => {
      const current = DocsFixture.byText(nav, "a", "Radio");
      const other = DocsFixture.byText(nav, "a", "Checkbox");
      const box = current.getBoundingClientRect();
      const navBox = nav.getBoundingClientRect();

      expect(current.getAttribute("aria-current")).toBe("page");
      expect(getComputedStyle(current).backgroundColor).toBe(ForcedColorsFixture.resolve("Highlight"));
      expect(getComputedStyle(current).color).toBe(ForcedColorsFixture.resolve("HighlightText"));
      expect(getComputedStyle(other).backgroundColor).not.toBe(ForcedColorsFixture.resolve("Highlight"));
      expect(getComputedStyle(other).color).not.toBe(ForcedColorsFixture.resolve("HighlightText"));
      expect(box.width).toBe(other.getBoundingClientRect().width);
      expect(box.left).toBeGreaterThanOrEqual(navBox.left);
      expect(box.right).toBeLessThanOrEqual(navBox.right);
      expect(current.contains(document.elementFromPoint(box.left + 1, box.top + box.height / 2))).toBe(true);

      await userEvent.keyboard("{Shift}");
      current.focus();
      await DomChangeFixture.untilAsync(() => expect(current.matches(":focus-visible")).toBe(true));
      expect(getComputedStyle(current).outlineColor).toBe(ForcedColorsFixture.resolve("HighlightText"));
      expect(getComputedStyle(current).outlineStyle).toBe("solid");

      await userEvent.hover(current);
      await DomChangeFixture.untilAsync(() => expect(current.matches(":hover")).toBe(true));
      expect(getComputedStyle(current).backgroundColor).toBe(ForcedColorsFixture.resolve("Highlight"));
      expect(getComputedStyle(current).color).toBe(ForcedColorsFixture.resolve("HighlightText"));
    };

    describe.each([["Light"], ["Dark"]])("in the %s mode", mode => {
      it("marks the menu's current page with the highlight fill and its text on a desktop, through hover and focus", async () => {
        DocsFixture.setMode(mode);
        await ForcedColorsFixture.activateAsync();
        const host = DocsFixture.host(await renderAsync("/components/radio"));
        const nav = DocsFixture.one(host, "#nol-docs-menu");
        await DomChangeFixture.untilAsync(() => expect(getComputedStyle(nav).display).toBe("grid"));

        await expectCurrentMarkedAsync(nav);
      });

      it("marks the current page the same way in the phone menu", async () => {
        DocsFixture.setMode(mode);
        await DocsFixture.viewAsync(DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT);
        await ForcedColorsFixture.activateAsync();
        const host = DocsFixture.host(await renderAsync("/components/radio"));
        const nav = DocsFixture.one(host, "#nol-docs-menu");
        const button = DocsFixture.one(host, "button.nol-docs-menu-button");

        button.focus();
        await userEvent.keyboard("{Enter}");
        await DomChangeFixture.untilAsync(() => expect(getComputedStyle(nav).display).toBe("grid"));

        await expectCurrentMarkedAsync(nav);
      });
    });
  });

  describe.each([["Light", "light"], ["Dark", "dark"]])("on a phone in the %s mode, a %s color scheme", (mode, scheme) => {
    it("starts the page's content right under the header, and opens the menu above it from the menu button", async () => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT);
      const fixture = await renderAsync("/components/button");
      const host = DocsFixture.host(fixture);
      const header = DocsFixture.one(host, "nol-site-header");
      const menu = DocsFixture.one(host, "#nol-docs-menu");
      const main = DocsFixture.one(host, "main");
      const button = DocsFixture.one(host, "button.nol-docs-menu-button");

      expect(getComputedStyle(document.documentElement).colorScheme).toBe(scheme);
      expect(main.getBoundingClientRect().top).toBe(topOf(host));
      expect(DocsFixture.one(host, ".nol-docs-pages-bar").getBoundingClientRect().top).toBe(header.getBoundingClientRect().bottom);
      expect(DocsFixture.one(main, "h1").getBoundingClientRect().bottom).toBeLessThanOrEqual(DocsFixture.PHONE_HEIGHT / 2);
      expect(button.getBoundingClientRect().left).toBeGreaterThanOrEqual(header.getBoundingClientRect().left);

      await userEvent.click(button);
      await DomChangeFixture.untilAsync(() => expect(button.getAttribute("aria-expanded")).toBe("true"));
      expect(menu.getBoundingClientRect().top).toBe(topOf(host));
      expect(menu.getBoundingClientRect().bottom).toBeLessThanOrEqual(main.getBoundingClientRect().top);
      expect(DocsFixture.overflowWidth()).toBe(0);

      await userEvent.click(button);
      await DomChangeFixture.untilAsync(() => expect(getComputedStyle(menu).display).toBe("none"));
      expect(button.getAttribute("aria-expanded")).toBe("false");
    });
  });

  it("opens and closes the menu from the keyboard, and Escape closes it with the focus back on its button", async () => {
    await DocsFixture.viewAsync(DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT);
    const fixture = await renderAsync("/");
    const host = DocsFixture.host(fixture);
    const menu = DocsFixture.one(host, "#nol-docs-menu");
    const button = DocsFixture.one(host, "button.nol-docs-menu-button");

    button.focus();
    await userEvent.keyboard("{Enter}");
    await DomChangeFixture.untilAsync(() => expect(button.getAttribute("aria-expanded")).toBe("true"));
    await userEvent.keyboard(" ");
    await DomChangeFixture.untilAsync(() => expect(button.getAttribute("aria-expanded")).toBe("false"));

    await userEvent.keyboard("{Enter}");
    await DomChangeFixture.untilAsync(() => expect(getComputedStyle(menu).display).toBe("grid"));
    DocsFixture.byText(menu, "a", "Button").focus();
    await userEvent.keyboard("{Escape}");

    await DomChangeFixture.untilAsync(() => expect(button.getAttribute("aria-expanded")).toBe("false"));
    expect(document.activeElement).toBe(button);
  });

  it.each([["another page", "Button", "Button"], ["the page already shown", "Getting started", "Getting started"]])(
    "closes the menu and moves the focus to the page's heading when a phone reader chooses %s", async (_case, link, title) => {
      await DocsFixture.viewAsync(DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT);
      const fixture = await renderAsync("/");
      const host = DocsFixture.host(fixture);
      const menu = DocsFixture.one(host, "#nol-docs-menu");
      const button = DocsFixture.one(host, "button.nol-docs-menu-button");

      await userEvent.click(button);
      await DomChangeFixture.untilAsync(() => expect(getComputedStyle(menu).display).toBe("grid"));
      await userEvent.click(DocsFixture.byText(menu, "a", link));

      await DomChangeFixture.untilAsync(() => expect(document.activeElement?.tagName).toBe("H1"));
      expect(document.activeElement?.textContent?.trim()).toBe(title);
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(getComputedStyle(menu).display).toBe("none");
    });

  it("leaves the focus on a desktop menu's link the reader chose", async () => {
    const fixture = await renderAsync("/");
    const host = DocsFixture.host(fixture);
    const link = DocsFixture.byText(DocsFixture.one(host, "#nol-docs-menu"), "a", "Button");

    await userEvent.click(link);
    await DomChangeFixture.untilAsync(() => expect(heading(fixture)).toBe("Button"));

    expect(document.activeElement).toBe(link);
  });

  it("reaches the Button page from its menu group and marks its link current", async () => {
    const fixture = await renderAsync("/");
    const host = DocsFixture.host(fixture);
    const nav = DocsFixture.one(host, "#nol-docs-menu");

    expect(DocsFixture.all(nav, ":scope > a").map(t => t.textContent?.trim())).toEqual(["Getting started", "Theme tokens"]);
    expect(DocsFixture.all(nav, "nol-section-header").map(t => t.textContent?.trim())).toEqual(["Inputs", "Choices", "Overlays and menus", "Content", "Status", "Layout"]);
    expect(DocsFixture.all(nav, "nol-section-header").map(t => [t.getAttribute("role"), t.getAttribute("aria-level")])).toEqual(Array(6).fill(["heading", "2"]));
    await userEvent.click(DocsFixture.byText(nav, "a", "Button"));

    await DomChangeFixture.untilAsync(() => expect(heading(fixture)).toBe("Button"));
    expect(DocsFixture.byText(nav, "a", "Button").getAttribute("aria-current")).toBe("page");
    expect(DocsFixture.byText(nav, "a", "Getting started").getAttribute("aria-current")).toBeNull();
  });

  it("reaches the Button page from a search for one of its inputs", async () => {
    const fixture = await renderAsync("/");
    const host = DocsFixture.host(fixture);
    const field = DocsFixture.one(host, "input[type=search]");

    await userEvent.fill(field, "variant");
    await DomChangeFixture.untilAsync(() => expect(DocsFixture.all(host, ".nol-docs-search-result").map(t => t.textContent?.trim())).toEqual(["Button"]));
    await userEvent.click(DocsFixture.byText(host, ".nol-docs-search-result", "Button"));

    await DomChangeFixture.untilAsync(() => expect(heading(fixture)).toBe("Button"));
    expect(host.querySelector(".nol-docs-search-results")).toBeNull();
  });

  it("shows the getting started page at the site's root", async () => {
    const fixture = await renderAsync("/");

    expect(heading(fixture)).toBe("Getting started");
  });

  describe.each([
    ["Light", 1920, 1080, "a 1920 by 1080 window, wider than the 108rem layout"],
    ["Dark", 1920, 1080, "a 1920 by 1080 window, wider than the 108rem layout"],
    ["Light", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT, "a 1280 by 800 window"],
    ["Dark", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT, "a 1280 by 800 window"],
    ["Light", DocsFixture.DESKTOP_WIDTH / 2, DocsFixture.DESKTOP_HEIGHT / 2, "that window at 200% zoom"],
    ["Dark", DocsFixture.DESKTOP_WIDTH / 2, DocsFixture.DESKTOP_HEIGHT / 2, "that window at 200% zoom"]
  ])("in the %s mode at %i by %i CSS pixels, %s", (mode, width, height) => {
    const pixels = (element: HTMLElement): number => Number.parseFloat(getComputedStyle(element).fontSize);

    const pageAsync = async (url: string): Promise<HTMLElement> => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(width, height);
      const host = DocsFixture.host(await renderAsync(url));
      await DomChangeFixture.untilAsync(() => expect([host.querySelectorAll("main .nol-docs-example-preview").length > 0, host.querySelector(".nol-docs-states .nol-gallery-specimen") !== null]).toEqual([true, true]));
      return host;
    };

    const edges = (host: HTMLElement): { page: DOMRect; start: number; end: number } => {
      const main = DocsFixture.one(host, "main");
      const box = main.getBoundingClientRect();
      const style = getComputedStyle(main);
      return { page: DocsFixture.one(host, ".nol-docs-page").getBoundingClientRect(), start: box.left + Number.parseFloat(style.paddingInlineStart), end: box.right - Number.parseFloat(style.paddingInlineEnd) };
    };

    it("draws the site's own text at 14px with paragraph lines one and a half times as tall, its page title at 28px, and the examples and states at the kit's 13px, a button in them at the kit's 12px label size", async () => {
      const host = await pageAsync("/components/button");
      const text = DocsFixture.one(host, "main p.nol-docs-text");
      const own = [text, DocsFixture.one(host, ".nol-docs-menu-link"), DocsFixture.one(host, ".nol-docs-search-field")];
      const kit = [DocsFixture.one(host, ".nol-docs-example-preview > *"), DocsFixture.one(host, ".nol-docs-states .nol-gallery-specimen"), DocsFixture.one(host, ".nol-docs-example-preview button")];

      expect(own.map(pixels).map(Math.round)).toEqual([14, 14, 14]);
      expect(Number.parseFloat(getComputedStyle(text).lineHeight)).toBe(21);
      expect(Math.round(pixels(DocsFixture.one(host, "main h1")))).toBe(28);
      expect(kit.map(pixels).map(Math.round)).toEqual([13, 13, 12]);
      if (width >= DocsFixture.DESKTOP_WIDTH)
        await DomChangeFixture.untilAsync(() => expect(Math.round(pixels(DocsFixture.one(host, ".nol-docs-outline-link")))).toBe(14));
    });

    it("puts the kit's 12px space above a section header, scaled to the site's text, above each of the menu's group headers, beside the menu's gap, and the kit's own above a later section header in an example", async () => {
      const host = await pageAsync("/components/section-header");
      const scale = 14 / 13;
      const menu = DocsFixture.all(host, ".nol-docs-menu nol-section-header");
      const example = DocsFixture.all(host, ".nol-docs-example-preview nol-section-header").filter(t => t.previousElementSibling !== null);
      const margin = (element: HTMLElement): number => Number.parseFloat(getComputedStyle(element).marginTop);

      expect(menu.map(t => margin(t))).toEqual(menu.map(() => expect.closeTo(12 * scale, 2)));
      expect(example.map(t => margin(t))).toEqual([12]);
      if (width >= DocsFixture.DESKTOP_WIDTH)
        expect(menu.map(t => t.getBoundingClientRect().top - (t.previousElementSibling?.getBoundingClientRect().bottom ?? Number.NaN)))
          .toEqual(menu.map(() => expect.closeTo((12 + 4) * scale, 1)));
    });

    it("draws the site's own code blocks at 13px with lines one and a half times as tall, leaving the kit's code block in an example at its 12px and code in the text at the site's code size", async () => {
      const host = await pageAsync("/components/code-block");
      const line = (element: HTMLElement): number => Number.parseFloat(getComputedStyle(element).lineHeight);
      const source = DocsFixture.one(host, ".nol-docs-example-code .nol-code-block-body");
      const preview = DocsFixture.one(host, ".nol-docs-example-preview nol-code-block .nol-code-block-body");
      const text = DocsFixture.one(host, "main .nol-docs-text code");

      expect([pixels(source), line(source)]).toEqual([13, 19.5]);
      expect([pixels(preview), line(preview)]).toEqual([12, 18]);
      expect(Math.round(pixels(text) * 100) / 100).toBe(12.92);
    });

    it("draws the site's own code blocks on a ground lighter than the kit's code block in the Light mode and darker in the Dark one", async () => {
      const host = await pageAsync("/components/code-block");
      const ground = (element: HTMLElement): number => {
        const [red = 0, green = 0, blue = 0] = (getComputedStyle(element).backgroundColor.match(/\d+(\.\d+)?/gu) ?? []).map(Number);
        return red + green + blue;
      };
      const own = ground(DocsFixture.one(host, "nol-code-block.nol-docs-example-code"));
      const kit = ground(DocsFixture.one(host, ".nol-docs-example-preview nol-code-block"));

      if (mode === "Light")
        expect(own).toBeGreaterThan(kit);
      else
        expect(own).toBeLessThan(kit);
    });

    it("lays the menu, the page and the list across at most 108rem centered in the window, in from its sides alike from 48rem wide, the page filling the space between them", async () => {
      const host = await pageAsync("/components/button");
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      const body = DocsFixture.one(host, ".nol-docs-body");
      const box = body.getBoundingClientRect();
      const style = getComputedStyle(body);
      const page = edges(host);
      const start = Number.parseFloat(style.paddingInlineStart);

      expect(box.width / rem).toBeLessThanOrEqual(108 + 0.01);
      expect(Math.abs(box.left - (document.documentElement.clientWidth - box.right)) / rem).toBeLessThanOrEqual(0.01);
      expect([start > 0, Number.parseFloat(style.paddingInlineEnd)]).toEqual([width >= 48 * rem, start]);
      expect([Math.abs(page.page.left - page.start) / rem <= 0.01, Math.abs(page.end - page.page.right) / rem <= 0.01]).toEqual([true, true]);
      expect(DocsFixture.overflowWidth()).toBe(0);
    });
  });

  describe.each([
    ["Light", 1920, 1080],
    ["Dark", 1920, 1080],
    ["Light", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
    ["Dark", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT]
  ])("on a desktop in the %s mode at %i by %i CSS pixels", (mode, width, height) => {
    const deskAsync = async (): Promise<HTMLElement> => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(width, height);
      const host = DocsFixture.host(await renderAsync("/components/button"));
      await DomChangeFixture.untilAsync(() => expect(host.querySelectorAll(".nol-docs-outline-link").length).toBeGreaterThan(0));
      return host;
    };

    it("starts the header's wordmark and the footer's where the menu's text starts, and ends the header's theme switch where the list's links end", async () => {
      const host = await deskAsync();
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      const range = document.createRange();
      range.selectNodeContents(DocsFixture.one(host, ".nol-docs-menu-link"));
      const menuText = range.getBoundingClientRect().left;
      const list = DocsFixture.one(host, ".nol-docs-outline-list");
      const theme = DocsFixture.one(host, "nol-site-header nol-site-theme-switch").getBoundingClientRect();

      expect(Math.abs(DocsFixture.one(host, "nol-site-header .nol-site-wordmark").getBoundingClientRect().left - menuText) / rem).toBeLessThanOrEqual(0.01);
      expect(Math.abs(DocsFixture.one(host, "nol-site-footer .nol-site-wordmark").getBoundingClientRect().left - menuText) / rem).toBeLessThanOrEqual(0.01);
      expect(Math.abs(theme.right - list.getBoundingClientRect().right) / rem).toBeLessThanOrEqual(0.01);
    });

    it("scrolls the menu and the list on their own, keeping the list's heading in view and both inside the window", async () => {
      const host = await deskAsync();
      const menu = DocsFixture.one(host, ".nol-docs-menu");
      const list = DocsFixture.one(host, ".nol-docs-outline-list");
      const title = DocsFixture.one(host, ".nol-docs-outline-title");

      expect([getComputedStyle(menu).overflowY, getComputedStyle(list).overflowY]).toEqual(["auto", "auto"]);
      expect(list.contains(title)).toBe(false);
      expect([menu.getBoundingClientRect().bottom <= window.innerHeight, DocsFixture.one(host, "nol-docs-on-this-page").getBoundingClientRect().bottom <= window.innerHeight]).toEqual([true, true]);
    });
  });
});
