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
import { userEvent } from "vitest/browser";

import { ForcedColorsFixture } from "../../../../../noldova.ui.components.angular/tests/fixtures/forced-colors.fixture.js";
import { routes } from "../../../../src/app/app.routes.js";
import { DocsShellComponent } from "../../../../src/app/components/docs-shell/docs-shell.component.js";
import { DocsCatalog } from "../../../../src/app/models/docs-catalog.js";
import { DocsFixture } from "../../../fixtures/docs.fixture.js";

describe("DocsOnThisPageComponent", () => {
  const radioSections = ["Examples", "Radios in a group, one of them disabled", "A radio on its own, bound to its owner", "States", "API", "Inputs", "Outputs",
    "Accessibility", "Specification", "Default geometry", "Text role", "Surface and behavior"];
  const specificationHeadings = "section[aria-labelledby=\"nol-docs-page-specification\"] .nol-markdown-heading[role=heading]";
  const ownHeadings = `h2.nol-docs-section-title, h3.nol-docs-subsection-title, h3.nol-docs-example-title, ${specificationHeadings}[aria-level="2"], ${specificationHeadings}[aria-level="3"]`;

  const renderAsync = async (url: string): Promise<ComponentFixture<DocsShellComponent>> => {
    window.scrollTo(0, 0);
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding()), provideMarkdown()] });
    const fixture = TestBed.createComponent(DocsShellComponent);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    return fixture;
  };

  const links = (host: HTMLElement): readonly HTMLElement[] => DocsFixture.all(host, "nav[aria-labelledby=\"nol-docs-outline-title\"] a");

  const titles = (host: HTMLElement): readonly (string | undefined)[] => links(host).map(t => t.textContent?.trim());

  const addressOf = (link: HTMLElement): URL => new URL(link.getAttribute("href") ?? String(), document.baseURI);

  const targetOf = (link: HTMLElement): HTMLElement => DocsFixture.one(document, addressOf(link).hash);

  const settledAsync = async (host: HTMLElement): Promise<void> => {
    await vi.waitFor(() => {
      expect(titles(host)).toEqual(radioSections);
      expect(DocsFixture.one(host, "main").textContent).toContain("Default geometry");
    });
  };

  const depthOf = (link: HTMLElement): number =>
    link.classList.contains("nol-docs-outline-nested-twice") ? 2 : link.classList.contains("nol-docs-outline-nested") ? 1 : 0;

  const levelOf = (heading: HTMLElement): number => heading.tagName === "H2" ? 2 : heading.tagName === "H3" ? 3 : Number(heading.getAttribute("aria-level")) + 1;

  const headerBottom = (host: HTMLElement): number => DocsFixture.one(host, ".nol-docs-header").getBoundingClientRect().bottom;

  const current = (host: HTMLElement): readonly (string | undefined)[] => links(host).filter(t => t.getAttribute("aria-current") === "location").map(t => t.textContent?.trim());

  afterEach(async () => {
    window.scrollTo(0, 0);
    await ForcedColorsFixture.resetAsync();
    await DocsFixture.resetAsync();
  });

  it("lists a page's second- and third-level headings in order under its label, each linking to its heading", async () => {
    const fixture = await renderAsync("/components/radio");
    const host = DocsFixture.host(fixture);
    await settledAsync(host);
    const nav = DocsFixture.one(host, "nav[aria-labelledby=\"nol-docs-outline-title\"]");

    expect(DocsFixture.one(nav, "#nol-docs-outline-title").textContent?.trim()).toBe("On this page");
    expect(links(host).map(t => targetOf(t).textContent?.trim())).toEqual(radioSections);
    expect(links(host).map(t => targetOf(t).tagName)).toEqual(["H2", "H3", "H3", "H2", "H2", "H3", "H3", "H2", "H2", "P", "P", "P"]);
    expect(links(host).map(depthOf)).toEqual([0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1]);
    expect(links(host).slice(-3).map(t => targetOf(t).closest("section")?.getAttribute("aria-labelledby"))).toEqual(Array(3).fill("nol-docs-page-specification"));
    expect(links(host).every(t => addressOf(t).pathname.startsWith("/components/radio"))).toBe(true);
  });

  it("lists exactly the sections of every page the menu links, with the Specification's second- and third-level headings nested under it", async () => {
    const fixture = await renderAsync("/");
    const host = DocsFixture.host(fixture);
    const pages = [DocsCatalog.gettingStarted, DocsCatalog.tokens, ...DocsCatalog.menuGroups.flatMap(t => t.pages)];
    let specificationCount = 0;

    for (const page of pages) {
      await TestBed.inject(Router).navigateByUrl(page.link);
      await vi.waitFor(() => {
        const main = DocsFixture.one(host, "main");
        if (page.content !== null)
          expect(DocsFixture.all(main, "section[aria-labelledby=\"nol-docs-page-specification\"] nol-markdown-view .nol-markdown-blocks > *").length).toBeGreaterThan(0);
        const headings = DocsFixture.all(main, ownHeadings);
        expect(headings.length).toBeGreaterThan(0);
        expect(titles(host)).toEqual(headings.map(t => t.textContent?.trim()));
        expect(links(host).map(depthOf)).toEqual(headings.map(t => levelOf(t) - 2));
      });
      specificationCount += DocsFixture.all(DocsFixture.one(host, "main"), specificationHeadings).length;
    }
    expect(specificationCount).toBeGreaterThan(0);
  });

  it("leaves out the headings an example's components render", async () => {
    const fixture = await renderAsync("/components/card");
    const host = DocsFixture.host(fixture);
    await vi.waitFor(() => expect(DocsFixture.all(host, ".nol-docs-example-preview h3").map(t => t.textContent?.trim())).toEqual(["Trip plan", "Reading list"]));
    await vi.waitFor(() => expect(titles(host)).toContain("Specification"));

    expect(titles(host).filter(t => t === "Trip plan" || t === "Reading list")).toEqual([]);

    await TestBed.inject(Router).navigateByUrl("/components/markdown-view");
    await vi.waitFor(() => expect(DocsFixture.all(host, ".nol-docs-example-preview .nol-markdown-heading[role=heading]").map(t => t.textContent?.trim())).toContain("Pin a note"));
    await vi.waitFor(() => expect(titles(host)).toContain("Surface and behavior"));

    expect(titles(host)).not.toContain("Pin a note");
  });

  it("scrolls the section a link names to just below the header, puts its anchor in the address and marks it, and does so again for the same link", async () => {
    const fixture = await renderAsync("/components/radio");
    const host = DocsFixture.host(fixture);
    await settledAsync(host);
    const api = DocsFixture.byText(host, ".nol-docs-outline-link", "API");
    const target = targetOf(api);

    await userEvent.click(api);
    await vi.waitFor(() => {
      expect(Math.abs(target.getBoundingClientRect().top - headerBottom(host))).toBeLessThanOrEqual(1);
      expect(current(host)).toEqual(["API"]);
    });
    expect(TestBed.inject(Router).url).toBe(`/components/radio#${target.id}`);

    window.scrollTo(0, 0);
    await vi.waitFor(() => expect(current(host)).toEqual([]));
    await userEvent.click(api);
    await vi.waitFor(() => expect(Math.abs(target.getBoundingClientRect().top - headerBottom(host))).toBeLessThanOrEqual(1));
  });

  it("lands on the section an address's anchor names, just below the header, once the page above it has loaded", async () => {
    const fixture = await renderAsync("/components/radio#nol-docs-page-api");
    const host = DocsFixture.host(fixture);
    await settledAsync(host);
    const target = DocsFixture.one(host, "#nol-docs-page-api");
    expect(document.documentElement.scrollHeight - target.getBoundingClientRect().top - window.scrollY).toBeGreaterThanOrEqual(window.innerHeight);

    await vi.waitFor(() => expect(Math.abs(target.getBoundingClientRect().top - headerBottom(host))).toBeLessThanOrEqual(1));
    expect(window.scrollY).toBeGreaterThan(0);

    DocsFixture.one(host, "main h1").style.paddingBlockStart = "20rem";
    await vi.waitFor(() => expect(Math.abs(target.getBoundingClientRect().top - headerBottom(host))).toBeLessThanOrEqual(1));
  });

  it("marks the section being read as the page scrolls, and the last one in view at the page's end", async () => {
    const fixture = await renderAsync("/components/radio");
    const host = DocsFixture.host(fixture);
    await settledAsync(host);
    const states = DocsFixture.byText(host, "main h2", "States");

    expect(current(host)).toEqual([]);
    window.scrollTo(0, states.getBoundingClientRect().top + window.scrollY);
    await vi.waitFor(() => expect(current(host)).toEqual(["States"]));

    window.scrollTo(0, document.documentElement.scrollHeight);
    await vi.waitFor(() => expect(current(host)).toEqual(["Surface and behavior"]));
  });

  it("marks the section being read in Highlight under forced colors, and the others in the link color", async () => {
    await ForcedColorsFixture.activateAsync();
    const fixture = await renderAsync("/components/radio");
    const host = DocsFixture.host(fixture);
    await settledAsync(host);
    window.scrollTo(0, DocsFixture.byText(host, "main h2", "States").getBoundingClientRect().top + window.scrollY);
    await vi.waitFor(() => expect(current(host)).toEqual(["States"]));
    const marks = links(host).map(t => getComputedStyle(t).borderInlineStartColor);

    expect(marks.filter((_t, i) => radioSections[i] === "States")).toEqual([ForcedColorsFixture.resolve("Highlight")]);
    expect(new Set(marks.filter((_t, i) => radioSections[i] !== "States"))).toEqual(new Set([ForcedColorsFixture.resolve("LinkText")]));
  });

  it("stops holding a reached section once the reader scrolls", async () => {
    const fixture = await renderAsync("/components/radio#nol-docs-page-api");
    const host = DocsFixture.host(fixture);
    await settledAsync(host);
    const target = DocsFixture.one(host, "#nol-docs-page-api");
    expect(document.documentElement.scrollHeight - target.getBoundingClientRect().top - window.scrollY).toBeGreaterThanOrEqual(window.innerHeight);
    await vi.waitFor(() => expect(Math.abs(target.getBoundingClientRect().top - headerBottom(host))).toBeLessThanOrEqual(1));

    document.dispatchEvent(new WheelEvent("wheel", { bubbles: true }));
    window.scrollTo(0, 0);
    DocsFixture.one(host, "main h1").append(document.createTextNode(" "));

    await vi.waitFor(() => expect(current(host)).toEqual([]));
    expect(window.scrollY).toBe(0);
  });

  describe.each([["Light", "light"], ["Dark", "dark"]])("in the %s mode, a %s color scheme", (mode, scheme) => {
    it("stands to the right of the page at a desktop width, inside the window, and is hidden at a phone width", async () => {
      DocsFixture.setMode(mode);
      const fixture = await renderAsync("/components/radio");
      const host = DocsFixture.host(fixture);
      await settledAsync(host);
      const outline = DocsFixture.one(host, "nol-docs-on-this-page");
      const main = DocsFixture.one(host, "main");
      const edge = document.documentElement.clientWidth;

      expect(getComputedStyle(document.documentElement).colorScheme).toBe(scheme);
      expect(outline.getBoundingClientRect().left).toBeGreaterThanOrEqual(main.getBoundingClientRect().right);
      expect(outline.getBoundingClientRect().right).toBeLessThanOrEqual(edge);
      expect(outline.getBoundingClientRect().width).toBeGreaterThan(0);
      expect(DocsFixture.overflowWidth()).toBe(0);

      await DocsFixture.viewAsync(DocsFixture.PHONE_WIDTH, DocsFixture.PHONE_HEIGHT);
      await vi.waitFor(() => expect(getComputedStyle(outline).display).toBe("none"));
      expect(main.getBoundingClientRect().right).toBe(document.documentElement.clientWidth);
      expect(DocsFixture.overflowWidth()).toBe(0);
    });
  });
});
