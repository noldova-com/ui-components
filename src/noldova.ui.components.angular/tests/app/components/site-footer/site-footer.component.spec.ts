/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { page } from "vitest/browser";

import { SiteFooterComponent } from "../../../../src/app/components/site-footer/site-footer.component";
import { SiteLink } from "../../../../src/app/models/site-link";
import { SiteLinkGroup } from "../../../../src/app/models/site-link-group";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

const wordmark = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 3'%3E%3Crect width='20' height='3'/%3E%3C/svg%3E";

@Component({
  imports: [SiteFooterComponent],
  template: `
    @if (notice(); as text) {
      <nol-site-footer [wordmark]="wordmark" [name]="name()" homeHref="/teamrun" [line]="line()" [groups]="groups()" [notice]="text" [wide]="wide()"><a class="extra" href="#privacy">Privacy</a></nol-site-footer>
    } @else {
      <nol-site-footer [wordmark]="wordmark" [name]="name()" [line]="line()" [groups]="groups()" [wide]="wide()" />
    }
  `
})
class SiteFooterHostComponent {
  public readonly wordmark: string = wordmark;
  public readonly name = signal<string | null>("TeamRun");
  public readonly line = signal<string | null>("Run a team of agents.");
  public readonly groups = signal<readonly SiteLinkGroup[]>([
    new SiteLinkGroup("Product", [new SiteLink("Download", "#download"), new SiteLink("Releases", "#releases", true)]),
    new SiteLinkGroup("Resources", [new SiteLink("Docs", "#docs")]),
    new SiteLinkGroup("Company", [new SiteLink("About", "#about"), new SiteLink("Contact", "#contact")])
  ]);
  public readonly notice = signal<string | null>(null);
  public readonly wide = signal(false);
}

describe("SiteFooterComponent", () => {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  let fixture: ComponentFixture<SiteFooterHostComponent>;

  async function renderAsync(change: (host: SiteFooterHostComponent) => void = () => undefined, theme = AppearanceFixture.themes[0], mode = AppearanceFixture.modes[0]): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(SiteFooterHostComponent);
    change(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const footer = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-site-footer");
  const part = (selector: string): HTMLElement => DomFixture.one(footer(), selector);
  const all = (selector: string): HTMLElement[] => DomFixture.all(footer(), selector);
  const box = (selector: string): DOMRect => part(selector).getBoundingClientRect();
  const edges = (): DOMRect => footer().getBoundingClientRect();
  const color = (key: string): string => AppearanceFixture.readColor(AppearanceFixture.themes[0], AppearanceFixture.modes[0], key);

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
    await page.viewport(viewport.width, viewport.height);
  });

  it("is the page's content information, on the panel color with no border", async () => {
    await renderAsync();
    const style = getComputedStyle(footer());

    expect([footer().getAttribute("role"), style.backgroundColor, style.borderTopWidth]).toEqual(["contentinfo", color("panel"), "0px"]);
  });

  it("links the lockup home, named for Noldova and the product, with the line under it", async () => {
    await renderAsync();
    const link = part(".nol-site-lockup-link");

    expect([link.getAttribute("href"), link.getAttribute("aria-label"), part(".nol-site-footer-line").textContent?.trim()]).toEqual(["/", "Noldova TeamRun", "Run a team of agents."]);
    AppearanceFixture.expectPixels(box(".nol-site-footer-line").top - box("nol-site-lockup").bottom, AppearanceFixture.measureLook("space-2"));
    expect(getComputedStyle(part(".nol-site-footer-line")).color).toBe(color("text-muted"));
  });

  it("links the lockup where it is told, and draws no line without one", async () => {
    await renderAsync(t => {
      t.notice.set("Made by Noldova");
      t.line.set(null);
    });

    expect([part(".nol-site-lockup-link").getAttribute("href"), DomFixture.maybe(footer(), ".nol-site-footer-line")]).toEqual(["/teamrun", null]);
  });

  it("draws each group as a navigation named by its title, its links in order with the current page marked", async () => {
    await renderAsync();

    expect(all(".nol-site-footer-group").map(t => [t.tagName, t.getAttribute("aria-label"), DomFixture.one(t, ".nol-site-footer-title").textContent?.trim()]))
      .toEqual([["NAV", "Product", "Product"], ["NAV", "Resources", "Resources"], ["NAV", "Company", "Company"]]);
    expect(all(".nol-site-footer-link").map(t => [t.textContent?.trim(), t.getAttribute("href"), t.getAttribute("aria-current")]))
      .toEqual([["Download", "#download", null], ["Releases", "#releases", "page"], ["Docs", "#docs", null], ["About", "#about", null], ["Contact", "#contact", null]]);
  });

  it("draws the titles strong and the links muted, each link at least a pointer target high", async () => {
    await renderAsync();

    expect([getComputedStyle(part(".nol-site-footer-title")).color, getComputedStyle(part(".nol-site-footer-link")).color]).toEqual([color("text-strong"), color("text-muted")]);
    for (const link of all(".nol-site-footer-link"))
      expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("pointer-target") - 1 / 32);
  });

  it("underlines a hovered link in the strong text color, and outlines a focused one in the accent color", async () => {
    await renderAsync();
    const [hovered, focused] = all(".nol-site-footer-link");
    hovered?.setAttribute("data-nol-state", "Hover");
    focused?.setAttribute("data-nol-state", "Focus");

    expect([getComputedStyle(DomFixture.present(hovered)).textDecorationLine, getComputedStyle(DomFixture.present(hovered)).color, getComputedStyle(DomFixture.present(focused)).outlineColor])
      .toEqual(["underline", color("text-strong"), color("accent")]);
  });

  it(`says © ${new Date().getFullYear()} Noldova at the bottom by default`, async () => {
    await renderAsync();

    expect(part(".nol-site-footer-notice").textContent?.trim()).toBe(`© ${new Date().getFullYear()} Noldova`);
  });

  it("says the notice it is given, with projected content at the bottom row's end", async () => {
    await renderAsync(t => t.notice.set("Made by Noldova"));
    const bottom = box(".nol-site-footer-bottom");

    expect(part(".nol-site-footer-notice").textContent?.trim()).toBe("Made by Noldova");
    AppearanceFixture.expectPixels(box(".extra").right, bottom.right);
    AppearanceFixture.expectPixels(box(".nol-site-footer-notice").left, bottom.left);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its insets, gaps, notice height and content width from the ${theme.id} theme in ${mode} mode`, async () => {
        await page.viewport(1920, 1000);
        await renderAsync(() => undefined, theme, mode);
        const inner = part(".nol-site-footer-inner");
        const style = getComputedStyle(inner);
        const width = AppearanceFixture.measureLook("site-content-width");
        const gap = AppearanceFixture.measureLook("site-footer-bottom-gap");

        AppearanceFixture.expectLook(style.paddingTop, theme, "site-footer-padding-top", "padding-top");
        AppearanceFixture.expectLook(style.paddingLeft, theme, "site-padding-inline", "padding-left");
        AppearanceFixture.expectPixels(inner.getBoundingClientRect().width, width);
        AppearanceFixture.expectPixels(inner.getBoundingClientRect().left - edges().left, (edges().width - width) / 2);
        AppearanceFixture.expectPixels(box(".nol-site-footer-bottom").top - box(".nol-site-footer-top").bottom, gap);
        AppearanceFixture.expectPixels(box(".nol-site-footer-bottom").height, AppearanceFixture.measureLook("site-footer-notice-height"));
        AppearanceFixture.expectPixels(box(".nol-site-footer-bottom").bottom, edges().bottom);
      });

  it("puts the groups in a row after the lockup, a gap apart, the last at the content's end", async () => {
    await page.viewport(1920, 1000);
    await renderAsync();
    const groups = all(".nol-site-footer-group").map(t => t.getBoundingClientRect());
    const inner = part(".nol-site-footer-inner");
    const end = inner.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(inner).paddingRight);
    const gap = AppearanceFixture.measureLook("site-footer-bottom-gap");

    expect(new Set(groups.map(t => Math.round(t.top))).size).toBe(1);
    AppearanceFixture.expectPixels(DomFixture.at(groups, 1).left - DomFixture.at(groups, 0).right, gap);
    AppearanceFixture.expectPixels(DomFixture.at(groups, 2).right, end);
    expect(DomFixture.at(groups, 0).left).toBeGreaterThan(box(".nol-site-footer-brand").left);
  });

  it("widens to the wide content width on a documentation site", async () => {
    await page.viewport(1920, 1000);
    await renderAsync(t => t.wide.set(true));

    AppearanceFixture.expectPixels(box(".nol-site-footer-inner").width, Math.min(edges().width, AppearanceFixture.measureLook("site-content-width-wide")));
  });

  it("puts the lockup on its own row and the groups in two columns on a phone", async () => {
    await page.viewport(375, 812);
    await renderAsync();
    const inset = AppearanceFixture.measureLook("site-padding-inline-phone");
    const groups = all(".nol-site-footer-group").map(t => t.getBoundingClientRect());
    const half = (edges().width - inset * 2 - AppearanceFixture.measureLook("space-4")) / 2;

    AppearanceFixture.expectPixels(box(".nol-site-footer-brand").left, edges().left + inset);
    AppearanceFixture.expectPixels(box(".nol-site-footer-brand").width, edges().width - inset * 2);
    AppearanceFixture.expectPixels(DomFixture.at(groups, 0).top - box(".nol-site-footer-brand").bottom, AppearanceFixture.measureLook("space-6"));
    AppearanceFixture.expectPixels(DomFixture.at(groups, 0).width, half);
    AppearanceFixture.expectPixels(DomFixture.at(groups, 1).left, edges().right - inset - half);
    AppearanceFixture.expectPixels(DomFixture.at(groups, 2).left, edges().left + inset);
    expect(DomFixture.at(groups, 2).top).toBeGreaterThan(DomFixture.at(groups, 0).bottom);
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws the wordmark and the lockup's name in LinkText under forced colors in ${mode} mode`, async () => {
      await renderAsync(() => undefined, AppearanceFixture.themes[0], mode);
      await ForcedColorsFixture.activateAsync();
      const link = ForcedColorsFixture.resolve("LinkText");

      expect([getComputedStyle(part(".nol-site-wordmark")).backgroundColor, getComputedStyle(part(".nol-site-lockup-name")).color]).toEqual([link, link]);
    });
});
