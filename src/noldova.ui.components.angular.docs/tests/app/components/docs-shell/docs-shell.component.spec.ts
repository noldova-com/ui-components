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
import { routes } from "../../../../src/app/app.routes.js";
import { DocsShellComponent } from "../../../../src/app/components/docs-shell/docs-shell.component.js";
import { DocsFixture } from "../../../fixtures/docs.fixture.js";

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
      await vi.waitFor(() => expect(host.querySelectorAll("nol-code-block pre code").length).toBeGreaterThan(0));

      const edge = document.documentElement.clientWidth;

      expect(getComputedStyle(document.documentElement).colorScheme).toBe(scheme);
      expect(window.innerWidth).toBe(width);
      expect(DocsFixture.overflowWidth()).toBe(0);
      expect(DocsFixture.one(host, ".nol-docs-header").getBoundingClientRect().right).toBeLessThanOrEqual(edge);
      expect(DocsFixture.one(host, "main").getBoundingClientRect().right).toBeLessThanOrEqual(edge);
    });
  });

  describe.each([
    ["Light", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
    ["Dark", DocsFixture.DESKTOP_WIDTH, DocsFixture.DESKTOP_HEIGHT],
    ["Light", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT],
    ["Dark", DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT]
  ])("in the %s mode at %ipx wide, the header", (mode, width, height) => {
    const githubMark = "M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656";
    const xMark = "M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z";

    const outside = (header: HTMLElement, selector: string): readonly HTMLElement[] => DocsFixture.all(document, selector).filter(t => !header.contains(t));

    const pathOf = (link: HTMLElement): SVGPathElement => {
      const path = link.querySelector("nol-docs-brand-mark[aria-hidden=true] svg path");
      if (!(path instanceof SVGPathElement))
        throw new TypeError("No mark's path in the link.");
      return path;
    };

    const nameOf = (element: HTMLElement): string =>
      [...element.childNodes].filter(t => t.nodeType === Node.TEXT_NODE).map(t => t.textContent).join(String()).trim();

    const renderHeaderAsync = async (): Promise<HTMLElement> => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(width, height);
      return DocsFixture.one(DocsFixture.host(await renderAsync("/")), ".nol-docs-header");
    };

    afterEach(() => ForcedColorsFixture.resetAsync());

    it("shows the Noldova wordmark, in the text's color, then the site's name", async () => {
      const header = await renderHeaderAsync();
      const brand = DocsFixture.one(header, ".nol-docs-brand");
      const wordmark = DocsFixture.one(brand, "[role=img]");
      const name = DocsFixture.byText(brand, "span", "UI Components");
      const style = getComputedStyle(wordmark);
      const em = parseFloat(getComputedStyle(brand).fontSize);
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const mark = wordmark.getBoundingClientRect();

      expect(wordmark.getAttribute("aria-label")).toBe("Noldova");
      expect(brand.getAttribute("href")).toBe("/");
      expect(style.backgroundColor).toBe(getComputedStyle(brand).color);
      expect(style.maskImage).toContain("/assets/noldova-wordmark.svg");
      expect(mark.height / em).toBeCloseTo(0.75, 2);
      expect(mark.width / mark.height).toBeCloseTo(1333.817 / 201.396, 1);
      expect(mark.right).toBeLessThanOrEqual(name.getBoundingClientRect().left);
      expect(Math.abs(mark.top + mark.height / 2 - (name.getBoundingClientRect().top + name.getBoundingClientRect().height / 2)) / rem).toBeLessThanOrEqual(0.25);
    });

    it("draws the wordmark in the link color under forced colors, as the brand link's text", async () => {
      await ForcedColorsFixture.activateAsync();
      const brand = DocsFixture.one(await renderHeaderAsync(), ".nol-docs-brand");
      const background = getComputedStyle(DocsFixture.one(brand, "[role=img]")).backgroundColor;

      expect(background).toBe(ForcedColorsFixture.resolve("LinkText"));
      expect(background).toBe(getComputedStyle(brand).color);
    });

    it("links to the kit's repository and to Noldova on X in this tab, each named by its brand and showing only that brand's mark", async () => {
      const header = await renderHeaderAsync();
      const links = DocsFixture.all(header, ".nol-docs-header-link");

      expect(links.map(t => [t.getAttribute("aria-label"), nameOf(t), t.getAttribute("href"), t.getAttribute("target")])).toEqual([
        ["GitHub", String(), "https://github.com/noldova-com/ui-components", null],
        ["X", String(), "https://x.com/noldova", null]
      ]);
      expect(links.map(t => pathOf(t).getAttribute("d"))).toEqual([githubMark, xMark]);
    });

    it("draws each mark 1rem square in the middle of a pointer target, black in the Light look and white in the Dark one", async () => {
      const header = await renderHeaderAsync();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const target = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nol-pointer-target"));

      for (const link of DocsFixture.all(header, ".nol-docs-header-link")) {
        const box = link.getBoundingClientRect();
        const mark = DocsFixture.one(link, "nol-docs-brand-mark").getBoundingClientRect();

        expect(mark.width / rem).toBeCloseTo(1, 2);
        expect(mark.height / rem).toBeCloseTo(1, 2);
        expect(box.width).toBeGreaterThanOrEqual(target);
        expect(box.height).toBeGreaterThanOrEqual(target);
        expect(Math.abs(mark.left + mark.width / 2 - (box.left + box.width / 2)) / rem).toBeLessThanOrEqual(0.05);
        expect(Math.abs(mark.top + mark.height / 2 - (box.top + box.height / 2)) / rem).toBeLessThanOrEqual(0.05);
        expect(getComputedStyle(pathOf(link)).fill).toBe(mode === "Light" ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)");
      }
    });

    it("draws the GitHub mark's circle 1rem across and the X 0.8rem tall, so the X's square ink looks no larger, each in the middle of its link", async () => {
      const header = await renderHeaderAsync();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const links = DocsFixture.all(header, ".nol-docs-header-link");
      const github = pathOf(DocsFixture.one(header, ".nol-docs-header-link[aria-label=\"GitHub\"]")).getBoundingClientRect();
      const x = pathOf(DocsFixture.one(header, ".nol-docs-header-link[aria-label=\"X\"]")).getBoundingClientRect();

      expect(github.width / rem).toBeCloseTo(1, 2);
      expect(x.height / rem).toBeCloseTo(0.8, 2);
      expect(x.height).toBeLessThan(github.height);
      expect(x.width).toBeLessThan(github.width);
      for (const [index, link] of links.entries()) {
        const box = link.getBoundingClientRect();
        const ink = pathOf(link).getBoundingClientRect();

        expect(Math.abs(ink.left + ink.width / 2 - (box.left + box.width / 2)) / rem, `link ${index}'s ink across`).toBeLessThanOrEqual(0.05);
        expect(Math.abs(ink.top + ink.height / 2 - (box.top + box.height / 2)) / rem, `link ${index}'s ink down`).toBeLessThanOrEqual(0.05);
      }
    });

    it("takes each mark's color from the site's --nol-docs-brand-mark", async () => {
      const header = await renderHeaderAsync();
      const root = document.documentElement;
      root.style.setProperty("--nol-docs-brand-mark", "rgb(1, 2, 3)");
      const fills = DocsFixture.all(header, ".nol-docs-header-link").map(t => getComputedStyle(pathOf(t)).fill);
      root.style.removeProperty("--nol-docs-brand-mark");

      expect(fills).toEqual(["rgb(1, 2, 3)", "rgb(1, 2, 3)"]);
    });

    it("shows each link's name as its tooltip under the pointer, inside the window", async () => {
      const header = await renderHeaderAsync();

      for (const link of DocsFixture.all(header, ".nol-docs-header-link")) {
        await userEvent.hover(link);
        await vi.waitFor(() => expect(outside(header, "[role=\"tooltip\"]").map(t => t.textContent?.trim())).toEqual([link.getAttribute("aria-label")]));
        const tip = outside(header, "[role=\"tooltip\"]")[0]?.getBoundingClientRect();

        expect(tip?.left).toBeGreaterThanOrEqual(0);
        expect(tip?.right).toBeLessThanOrEqual(document.documentElement.clientWidth);
        await userEvent.unhover(link);
        await vi.waitFor(() => expect(outside(header, "[role=\"tooltip\"]")).toEqual([]));
      }
    });

    it("draws each mark in the link color under forced colors", async () => {
      await ForcedColorsFixture.activateAsync();
      const header = await renderHeaderAsync();

      for (const link of DocsFixture.all(header, ".nol-docs-header-link")) {
        const fill = getComputedStyle(pathOf(link)).fill;

        expect(fill).toBe(ForcedColorsFixture.resolve("LinkText"));
        expect(fill).toBe(getComputedStyle(link).color);
      }
    });

    it("keeps the brand first on a desktop and right after the menu button on a phone, the links last, and every part inside the window", async () => {
      const header = await renderHeaderAsync();
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const box = header.getBoundingClientRect();
      const brand = DocsFixture.one(header, ".nol-docs-brand").getBoundingClientRect();
      const search = DocsFixture.one(header, "nol-docs-search").getBoundingClientRect();
      const theme = DocsFixture.one(header, "nol-docs-theme-switch").getBoundingClientRect();
      const links = DocsFixture.all(header, ".nol-docs-header-link").map(t => t.getBoundingClientRect());
      const last = DocsFixture.one(header, ".nol-docs-header-link:last-child").getBoundingClientRect();
      const style = getComputedStyle(header);
      const first = width === DocsFixture.DESKTOP_WIDTH ? brand : DocsFixture.one(header, "button.nol-docs-menu-button").getBoundingClientRect();

      expect((first.left - box.left - parseFloat(style.paddingInlineStart)) / rem).toBeCloseTo(0, 2);
      if (width !== DocsFixture.DESKTOP_WIDTH)
        expect(brand.left).toBeGreaterThanOrEqual(first.right);
      expect((box.right - last.right - parseFloat(style.paddingInlineEnd)) / rem).toBeCloseTo(0, 2);
      for (const part of [brand, search, theme, ...links])
        expect(part.right).toBeLessThanOrEqual(document.documentElement.clientWidth);
      for (const link of links) {
        expect(link.left).toBeGreaterThanOrEqual(theme.right);
        expect(Math.abs(link.top + link.height / 2 - (theme.top + theme.height / 2)) / rem).toBeLessThanOrEqual(0.25);
      }
      if (width === DocsFixture.DESKTOP_WIDTH) {
        expect(search.left).toBeGreaterThanOrEqual(brand.right);
        expect(theme.left).toBeGreaterThanOrEqual(search.right);
        for (const part of [search, theme])
          expect(Math.abs(part.top + part.height / 2 - (brand.top + brand.height / 2)) / rem).toBeLessThanOrEqual(0.25);
      }
      else {
        expect(search.top).toBeGreaterThanOrEqual(brand.bottom);
        expect(theme.top).toBeGreaterThanOrEqual(search.bottom);
      }
    });
  });

  it("puts the menu beside the page on a desktop, with no menu button, and behind a closed menu button on a phone", async () => {
    const fixture = await renderAsync("/");
    const host = DocsFixture.host(fixture);
    const menu = DocsFixture.one(host, "nav");
    const main = DocsFixture.one(host, "main");
    const button = DocsFixture.one(host, "button.nol-docs-menu-button");

    expect(menu.getBoundingClientRect().right).toBeLessThanOrEqual(main.getBoundingClientRect().left);
    expect(getComputedStyle(button).display).toBe("none");

    await DocsFixture.viewAsync(DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT);
    await vi.waitFor(() => expect(getComputedStyle(menu).display).toBe("none"));
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
      const header = DocsFixture.one(host, ".nol-docs-header");
      await vi.waitFor(() => expect(DocsFixture.one(host, "main").textContent).toContain("Default geometry"));
      const before = header.getBoundingClientRect().height;
      window.scrollTo(0, document.documentElement.scrollHeight / 2);
      await vi.waitFor(() => expect(window.scrollY).toBeGreaterThan(before));
      return { host, header, height: before };
    };

    afterEach(() => window.scrollTo(0, 0));

    it("keeps the header at the top of the window, at its height and in front of the page", async () => {
      const { header, height: before } = await scrolledAsync("/components/radio");
      const box = header.getBoundingClientRect();

      expect(box.top).toBe(0);
      expect(box.height).toBeCloseTo(before, 1);
      expect(getComputedStyle(header).backgroundColor).toMatch(/^rgb\(/u);
      expect(header.contains(document.elementFromPoint(box.left + box.width / 2, box.bottom - 1))).toBe(true);
      expect(header.contains(document.elementFromPoint(box.left + 1, box.top + 1))).toBe(true);
    });

    it("keeps the menu right below the header, in front of the page and in the window wherever the page is scrolled, scrolling on its own", async () => {
      const { host, header } = await scrolledAsync("/components/radio");
      const menu = DocsFixture.one(host, "nav#nol-docs-menu");
      if (width === DocsFixture.PHONE_WIDTH) {
        await userEvent.click(DocsFixture.one(host, "button.nol-docs-menu-button"));
        await vi.waitFor(() => expect(menu.getBoundingClientRect().height).toBeGreaterThan(0));
      }
      const expectInView = (): void => {
        const box = menu.getBoundingClientRect();

        expect(Math.abs(box.top - header.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0.5);
        expect(box.bottom).toBeLessThanOrEqual(window.innerHeight + 0.5);
        expect(menu.contains(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2))).toBe(true);
      };

      expectInView();
      const scrolled = window.scrollY;
      window.scrollTo(0, scrolled + window.innerHeight / 2);
      await vi.waitFor(() => expect(window.scrollY).toBeGreaterThan(scrolled));
      expectInView();
      expect(menu.scrollHeight).toBeGreaterThan(menu.clientHeight);
      menu.scrollTop = menu.scrollHeight;
      expect(menu.scrollTop).toBeGreaterThan(0);
    });

    it("lands a heading an address names fully below the header", async () => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(width, height);
      const host = DocsFixture.host(await renderAsync("/components/radio#nol-docs-page-api"));
      const header = DocsFixture.one(host, ".nol-docs-header");
      const target = DocsFixture.one(host, "#nol-docs-page-api");

      await vi.waitFor(() => {
        expect(window.scrollY).toBeGreaterThan(0);
        expect(Math.abs(target.getBoundingClientRect().top - header.getBoundingClientRect().bottom)).toBeLessThanOrEqual(1);
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
    const header = DocsFixture.one(DocsFixture.host(fixture), ".nol-docs-header");

    expect(root.style.getPropertyValue("--nol-docs-header-height")).toBe(`${header.getBoundingClientRect().height}px`);
  });

  it("takes the header height off the root when it goes", async () => {
    const fixture = await renderAsync("/");
    const root = document.documentElement;
    await vi.waitFor(() => expect(root.style.getPropertyValue("--nol-docs-header-height")).not.toBe(String()));

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
      const header = DocsFixture.one(host, ".nol-docs-header");
      await vi.waitFor(() => expect(DocsFixture.one(host, "main").textContent).toContain("Default geometry"));
      window.scrollTo(0, document.documentElement.scrollHeight / 2);
      await vi.waitFor(() => expect(window.scrollY).toBeGreaterThan(0));
      const box = header.getBoundingClientRect();

      expect(box.top).toBe(0);
      expect(getComputedStyle(header).backgroundColor).toBe(ForcedColorsFixture.resolve("Canvas"));
      expect(header.contains(document.elementFromPoint(box.left + box.width / 2, box.bottom - 1))).toBe(true);
    });
  });

  describe.each([["Light", "light"], ["Dark", "dark"]])("on a phone in the %s mode, a %s color scheme", (mode, scheme) => {
    it("starts the page's content right under the header, and opens the menu above it from the menu button", async () => {
      DocsFixture.setMode(mode);
      await DocsFixture.viewAsync(DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT);
      const fixture = await renderAsync("/components/button");
      const host = DocsFixture.host(fixture);
      const header = DocsFixture.one(host, ".nol-docs-header");
      const menu = DocsFixture.one(host, "nav");
      const main = DocsFixture.one(host, "main");
      const button = DocsFixture.one(host, "button.nol-docs-menu-button");

      expect(getComputedStyle(document.documentElement).colorScheme).toBe(scheme);
      expect(main.getBoundingClientRect().top).toBe(header.getBoundingClientRect().bottom);
      expect(DocsFixture.one(main, "h1").getBoundingClientRect().bottom).toBeLessThanOrEqual(DocsFixture.PHONE_HEIGHT / 2);
      expect(button.getBoundingClientRect().left).toBeGreaterThanOrEqual(header.getBoundingClientRect().left);

      await userEvent.click(button);
      await vi.waitFor(() => expect(button.getAttribute("aria-expanded")).toBe("true"));
      expect(menu.getBoundingClientRect().top).toBe(header.getBoundingClientRect().bottom);
      expect(menu.getBoundingClientRect().bottom).toBeLessThanOrEqual(main.getBoundingClientRect().top);
      expect(DocsFixture.overflowWidth()).toBe(0);

      await userEvent.click(button);
      await vi.waitFor(() => expect(getComputedStyle(menu).display).toBe("none"));
      expect(button.getAttribute("aria-expanded")).toBe("false");
    });
  });

  it("opens and closes the menu from the keyboard, and Escape closes it with the focus back on its button", async () => {
    await DocsFixture.viewAsync(DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT);
    const fixture = await renderAsync("/");
    const host = DocsFixture.host(fixture);
    const menu = DocsFixture.one(host, "nav");
    const button = DocsFixture.one(host, "button.nol-docs-menu-button");

    button.focus();
    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(button.getAttribute("aria-expanded")).toBe("true"));
    await userEvent.keyboard(" ");
    await vi.waitFor(() => expect(button.getAttribute("aria-expanded")).toBe("false"));

    await userEvent.keyboard("{Enter}");
    await vi.waitFor(() => expect(getComputedStyle(menu).display).toBe("grid"));
    DocsFixture.byText(menu, "a", "Button").focus();
    await userEvent.keyboard("{Escape}");

    await vi.waitFor(() => expect(button.getAttribute("aria-expanded")).toBe("false"));
    expect(document.activeElement).toBe(button);
  });

  it.each([["another page", "Button", "Button"], ["the page already shown", "Getting started", "Getting started"]])(
    "closes the menu and moves the focus to the page's heading when a phone reader chooses %s", async (_case, link, title) => {
      await DocsFixture.viewAsync(DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT);
      const fixture = await renderAsync("/");
      const host = DocsFixture.host(fixture);
      const menu = DocsFixture.one(host, "nav");
      const button = DocsFixture.one(host, "button.nol-docs-menu-button");

      await userEvent.click(button);
      await vi.waitFor(() => expect(getComputedStyle(menu).display).toBe("grid"));
      await userEvent.click(DocsFixture.byText(menu, "a", link));

      await vi.waitFor(() => expect(document.activeElement?.tagName).toBe("H1"));
      expect(document.activeElement?.textContent?.trim()).toBe(title);
      expect(button.getAttribute("aria-expanded")).toBe("false");
      expect(getComputedStyle(menu).display).toBe("none");
    });

  it("leaves the focus on a desktop menu's link the reader chose", async () => {
    const fixture = await renderAsync("/");
    const host = DocsFixture.host(fixture);
    const link = DocsFixture.byText(DocsFixture.one(host, "nav"), "a", "Button");

    await userEvent.click(link);
    await vi.waitFor(() => expect(heading(fixture)).toBe("Button"));

    expect(document.activeElement).toBe(link);
  });

  it("reaches the Button page from its menu group and marks its link current", async () => {
    const fixture = await renderAsync("/");
    const host = DocsFixture.host(fixture);
    const nav = DocsFixture.one(host, "nav");

    expect(DocsFixture.all(nav, ":scope > a").map(t => t.textContent?.trim())).toEqual(["Getting started", "Theme tokens"]);
    expect(DocsFixture.all(nav, "nol-section-header").map(t => t.textContent?.trim())).toEqual(["Inputs", "Choices", "Overlays and menus", "Content", "Status", "Layout"]);
    await userEvent.click(DocsFixture.byText(nav, "a", "Button"));

    await vi.waitFor(() => expect(heading(fixture)).toBe("Button"));
    expect(DocsFixture.byText(nav, "a", "Button").getAttribute("aria-current")).toBe("page");
    expect(DocsFixture.byText(nav, "a", "Getting started").getAttribute("aria-current")).toBeNull();
  });

  it("reaches the Button page from a search for one of its inputs", async () => {
    const fixture = await renderAsync("/");
    const host = DocsFixture.host(fixture);
    const field = DocsFixture.one(host, "input[type=search]");

    await userEvent.fill(field, "variant");
    await vi.waitFor(() => expect(DocsFixture.all(host, ".nol-docs-search-result").map(t => t.textContent?.trim())).toEqual(["Button"]));
    await userEvent.click(DocsFixture.byText(host, ".nol-docs-search-result", "Button"));

    await vi.waitFor(() => expect(heading(fixture)).toBe("Button"));
    expect(host.querySelector(".nol-docs-search-results")).toBeNull();
  });

  it("shows the getting started page at the site's root", async () => {
    const fixture = await renderAsync("/");

    expect(heading(fixture)).toBe("Getting started");
  });

  describe.each([
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
      await vi.waitFor(() => expect([host.querySelectorAll("main .nol-docs-example-preview").length > 0, host.querySelector(".nol-docs-states .nol-gallery-specimen") !== null]).toEqual([true, true]));
      return host;
    };

    const edges = (host: HTMLElement): { page: DOMRect; start: number; end: number } => {
      const main = DocsFixture.one(host, "main");
      const box = main.getBoundingClientRect();
      const style = getComputedStyle(main);
      return { page: DocsFixture.one(host, ".nol-docs-page").getBoundingClientRect(), start: box.left + Number.parseFloat(style.paddingInlineStart), end: box.right - Number.parseFloat(style.paddingInlineEnd) };
    };

    it("draws the site's own text at 16px, its page title at 32px, and the examples and states at the kit's 13px", async () => {
      const host = await pageAsync("/components/button");
      const own = [DocsFixture.one(host, "main .nol-docs-text"), DocsFixture.one(host, ".nol-docs-menu-link"), DocsFixture.one(host, ".nol-docs-search-field")];
      const kit = [DocsFixture.one(host, ".nol-docs-example-preview > *"), DocsFixture.one(host, ".nol-docs-states .nol-gallery-specimen"), DocsFixture.one(host, ".nol-docs-example-preview button")];

      expect(own.map(pixels).map(Math.round)).toEqual([16, 16, 16]);
      expect(Math.round(pixels(DocsFixture.one(host, "main h1")))).toBe(32);
      expect(kit.map(pixels).map(Math.round)).toEqual([13, 13, 13]);
      if (width === DocsFixture.DESKTOP_WIDTH)
        await vi.waitFor(() => expect(Math.round(pixels(DocsFixture.one(host, ".nol-docs-outline-link")))).toBe(16));
    });

    it("centers the page at most 48rem wide by default, and lays it across the space beside the menu at Full width", async () => {
      const host = await pageAsync("/components/button");
      const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      const centered = edges(host);

      expect(document.documentElement.hasAttribute(DocsFixture.LAYOUT_ATTRIBUTE)).toBe(false);
      expect(centered.page.width / rem).toBeLessThanOrEqual(48 + 0.01);
      expect(Math.abs((centered.page.left - centered.start) - (centered.end - centered.page.right)) / rem).toBeLessThanOrEqual(0.01);
      if (centered.end - centered.start < 48 * rem)
        expect([(centered.page.left - centered.start) / rem, (centered.end - centered.page.right) / rem].map(t => Math.abs(t) <= 0.01)).toEqual([true, true]);

      document.documentElement.setAttribute(DocsFixture.LAYOUT_ATTRIBUTE, "Full");
      await vi.waitFor(() => expect(Math.abs(edges(host).page.left - edges(host).start) / rem).toBeLessThanOrEqual(0.01));
      const full = edges(host);

      expect(Math.abs(full.end - full.page.right) / rem).toBeLessThanOrEqual(0.01);
      expect(DocsFixture.overflowWidth()).toBe(0);
    });

    it("shows the layout switch in the header only where the page can be wider than 48rem", async () => {
      const host = await pageAsync("/components/button");
      const switcher = DocsFixture.one(host, "nol-docs-layout-switch");

      expect(getComputedStyle(switcher).display === "none").toBe(width < 48 * 16);
    });
  });
});
