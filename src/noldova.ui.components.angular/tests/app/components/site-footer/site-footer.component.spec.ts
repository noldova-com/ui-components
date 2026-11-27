/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DOCUMENT, Injector, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { commands, page } from "vitest/browser";

import { SiteFooterComponent } from "../../../../src/app/components/site-footer/site-footer.component";
import { SiteWordmarkSize } from "../../../../src/app/enums/site-wordmark-size";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { SiteLink } from "../../../../src/app/models/site-link";
import { SiteLinkGroup } from "../../../../src/app/models/site-link-group";
import { SiteStageService } from "../../../../src/app/services/site-stage.service";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { PointerTargetFixture } from "../../../fixtures/pointer-target.fixture";

const wordmark = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 3'%3E%3Crect width='20' height='3'/%3E%3C/svg%3E";
const mark = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1'/%3E%3C/svg%3E";

@Component({
  imports: [SiteFooterComponent],
  template: `
    @if (notice(); as text) {
      <nol-site-footer [wordmark]="wordmark()" [wordmarkRatio]="wordmarkRatio()" [name]="name()" homeHref="/teamrun" [line]="line()" [groups]="groups()" [notice]="text" [wide]="wide()"><a class="extra" href="#privacy">Privacy</a></nol-site-footer>
    } @else {
      <nol-site-footer [wordmark]="wordmark()" [wordmarkRatio]="wordmarkRatio()" [name]="name()" [homeLabel]="homeLabel()" [wordmarkSize]="size()" [line]="line()" [groups]="groups()" [wide]="wide()" />
    }
  `
})
class SiteFooterHostComponent {
  public readonly wordmark = signal(wordmark);
  public readonly wordmarkRatio = signal(20 / 3);
  public readonly name = signal<string | null>("TeamRun");
  public readonly homeLabel = signal<string | null>(null);
  public readonly size = signal(SiteWordmarkSize.Small);
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
  const color = (key: string): string => AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, key);

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
    await page.viewport(viewport.width, viewport.height);
  });

  it("reserves the wordmark's width from the ratio the site passes before its file loads", async () => {
    await renderAsync(t => {
      t.wordmark.set("data:image/svg+xml,unreadable");
      t.wordmarkRatio.set(4);
    });
    const image = DomFixture.oneOf(footer(), "img.nol-site-wordmark-size", HTMLImageElement);
    const size = DomFixture.one(footer(), ".nol-site-wordmark").getBoundingClientRect();

    expect(image.naturalWidth).toBe(0);
    AppearanceFixture.expectPixels(size.height, AppearanceFixture.measureLook("site-wordmark"));
    AppearanceFixture.expectPixels(size.width, size.height * 4);
  });

  it("is the page's content information, on the window color with no border", async () => {
    await renderAsync();
    const style = getComputedStyle(footer());

    expect([footer().getAttribute("role"), style.backgroundColor, style.borderTopWidth]).toEqual(["contentinfo", color("window"), "0px"]);
  });

  it("links the lockup home, named for the product's home, with the line under it, muted at the message size with its line breaks", async () => {
    await renderAsync(t => t.line.set("Less copying between agents.\nMore work done."));
    const link = part(".nol-site-lockup-link");
    const line = getComputedStyle(part(".nol-site-footer-line"));
    const ratio = Number.parseFloat(DefaultTheme.theme.readLook("site-footer-line-height") ?? "");

    expect([link.getAttribute("href"), link.getAttribute("aria-label"), part(".nol-site-footer-line").textContent?.trim()]).toEqual(["/", "TeamRun home", "Less copying between agents.\nMore work done."]);
    AppearanceFixture.expectPixels(box(".nol-site-footer-line").top - box("nol-site-lockup").bottom, AppearanceFixture.measureLook("site-footer-line-gap"));
    expect([line.color, line.whiteSpace]).toEqual([color("text-muted"), "pre-line"]);
    AppearanceFixture.expectPixels(Number.parseFloat(line.fontSize), AppearanceFixture.measureLook("text-message"));
    AppearanceFixture.expectPixels(Number.parseFloat(line.lineHeight), Number.parseFloat(line.fontSize) * ratio);
    AppearanceFixture.expectPixels(box(".nol-site-footer-line").height, Number.parseFloat(line.lineHeight) * 2);
  });

  it("names the lockup's link with the label the site gives, and draws a product's own wordmark at the large size", async () => {
    await renderAsync(t => {
      t.name.set(null);
      t.homeLabel.set("TeamRun home");
      t.size.set(SiteWordmarkSize.Large);
    });

    expect([part(".nol-site-lockup-link").getAttribute("aria-label"), DomFixture.maybe(footer(), ".nol-site-lockup-name")]).toEqual(["TeamRun home", null]);
    // As high as TeamRun's header draws its wordmark, 9.125rem wide in its proportions.
    AppearanceFixture.expectPixels(box(".nol-site-wordmark").height, AppearanceFixture.toPixels(9.125 * 201.396 / 1335.64));
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

  it("draws the titles muted in monospace capitals and the links in the text color, both at the message size on the site's line, each link at least a pointer target high", async () => {
    await renderAsync();
    const title = getComputedStyle(part(".nol-site-footer-title"));
    const link = getComputedStyle(part(".nol-site-footer-link"));
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--nol-font-mono").trim();

    expect([title.color, title.textTransform, title.fontFamily, link.color]).toEqual([color("text-muted"), "uppercase", mono, color("text")]);
    AppearanceFixture.expectPixels(Number.parseFloat(title.fontSize), AppearanceFixture.measureLook("text-message"));
    AppearanceFixture.expectPixels(part(".nol-site-footer-title").getBoundingClientRect().height, Number.parseFloat(title.fontSize) * Number.parseFloat(DefaultTheme.theme.readLook("site-line-height") ?? String.empty));
    AppearanceFixture.expectPixels(Number.parseFloat(link.fontSize), AppearanceFixture.measureLook("text-message"));
    AppearanceFixture.expectPixels(Number.parseFloat(link.lineHeight), Number.parseFloat(link.fontSize) * Number.parseFloat(DefaultTheme.theme.readLook("site-line-height") ?? String.empty));
    for (const each of all(".nol-site-footer-link"))
      expect(each.getBoundingClientRect().height).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("pointer-target") - 1 / 32);
  });

  it("draws a link's icon before its label, a mask pure black in light mode, as the header's social marks, as high as its text, a space step from the label, its name still the label", async () => {
    await renderAsync(t => t.groups.set([new SiteLinkGroup("Connect", [new SiteLink("GitHub", "#github", false, mark), new SiteLink("Privacy", "#privacy")])]));
    const [github, privacy] = all(".nol-site-footer-link");
    const link = DomFixture.present(github);
    const icon = DomFixture.one(link, ".nol-site-footer-link-icon");
    const style = getComputedStyle(icon);
    const iconBox = icon.getBoundingClientRect();
    const text = document.createRange();
    text.selectNodeContents(link.lastChild ?? link);

    expect([icon.getAttribute("aria-hidden"), style.maskImage.includes("data:image/svg+xml"), style.backgroundColor, link.textContent?.trim()])
      .toEqual(["true", true, "rgb(0, 0, 0)", "GitHub"]);
    AppearanceFixture.expectPixels(iconBox.width, Number.parseFloat(getComputedStyle(link).fontSize));
    AppearanceFixture.expectPixels(iconBox.height, Number.parseFloat(getComputedStyle(link).fontSize));
    AppearanceFixture.expectPixels(text.getBoundingClientRect().left - iconBox.right, AppearanceFixture.measureLook("space-2"));
    expect(DomFixture.maybe(DomFixture.present(privacy), ".nol-site-footer-link-icon")).toBeNull();
  });

  it("underlines a hovered link in the strong text color, and outlines a focused one in the accent color", async () => {
    await renderAsync();
    const [hovered, focused] = all(".nol-site-footer-link");
    hovered?.setAttribute("data-nol-state", "Hover");
    focused?.setAttribute("data-nol-state", "Focus");

    expect([getComputedStyle(DomFixture.present(hovered)).textDecorationLine, getComputedStyle(DomFixture.present(hovered)).color, getComputedStyle(DomFixture.present(focused)).outlineColor])
      .toEqual(["underline", color("text-strong"), color("accent")]);
  });

  it(`says © ${new Date().getFullYear()} and Noldova's logo at the bottom by default, the logo the kit's own file, linking to noldova.com as Noldova in the notice's color`, async () => {
    await renderAsync();
    const owner = part(".nol-site-footer-owner");
    const logo = DomFixture.oneOf(owner, "svg.nol-site-footer-logo", SVGSVGElement);
    const file = new DOMParser().parseFromString(await commands.readFile("../../assets/brand/noldova-wordmark.svg"), "image/svg+xml");
    const drawn = DomFixture.oneOf(logo, "path", SVGPathElement);
    const source = DomFixture.oneOf(file, "path", SVGPathElement);

    expect([part(".nol-site-footer-notice").textContent?.trim(), owner.textContent?.trim(), owner.getAttribute("aria-label"), owner.getAttribute("href"), getComputedStyle(owner).color,
      getComputedStyle(owner).textDecorationLine, logo.getAttribute("aria-hidden"), getComputedStyle(drawn).fill])
      .toEqual([`© ${new Date().getFullYear()}`, "", "Noldova", "https://noldova.com", color("text-muted"), "none", "true", color("text-muted")]);
    expect([logo.getAttribute("viewBox"), drawn.getAttribute("d"), drawn.getAttribute("fill-rule")])
      .toEqual([file.documentElement.getAttribute("viewBox"), source.getAttribute("d"), source.getAttribute("fill-rule")]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws Noldova's logo in the notice's color in the ${theme.id} theme in ${mode} mode, as high as the notice's capitals, on its baseline, in the logo's proportions`, async () => {
        await renderAsync(() => undefined, theme, mode);
        const notice = part(".nol-site-footer-notice");
        const logo = DomFixture.oneOf(footer(), "svg.nol-site-footer-logo", SVGSVGElement);
        const capitals = document.createElement("span");
        capitals.style.cssText = "display: inline-block; block-size: 1cap; inline-size: 0";
        notice.append(capitals);
        const line = notice.getBoundingClientRect();
        const cap = capitals.getBoundingClientRect();
        const drawn = logo.getBoundingClientRect();
        capitals.remove();
        const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

        expect(getComputedStyle(DomFixture.oneOf(logo, "path", SVGPathElement)).fill).toBe(AppearanceFixture.readColor(theme, mode, "text-muted"));
        expect(cap.height / rem).toBeGreaterThan(0.5);
        AppearanceFixture.expectPixels(drawn.height, cap.height);
        AppearanceFixture.expectPixels(drawn.bottom, cap.bottom);
        expect(drawn.width / drawn.height).toBeCloseTo(1311.818 / 197.396, 1);
        expect([drawn.top >= line.top, drawn.bottom <= line.bottom]).toEqual([true, true]);
      });

  for (const [hostname, href] of [["teamrun.sandbox.noldova.com", "https://sandbox.noldova.com/"], ["teamrun.staging.noldova.com", "https://staging.noldova.com/"]] as const)
    it(`links Noldova to ${href} on a page at ${hostname}, the page's own stage`, async () => {
      const stage = Injector.create({ providers: [{ provide: DOCUMENT, useValue: { defaultView: { location: { hostname } } } }, SiteStageService] }).get(SiteStageService);
      TestBed.configureTestingModule({ providers: [{ provide: SiteStageService, useValue: stage }] });
      await renderAsync();

      expect(part(".nol-site-footer-owner").getAttribute("href")).toBe(href);
    });

  it("underlines the notice's link in the strong text color when hovered, and outlines it in the accent color when focused", async () => {
    await renderAsync();
    const owner = part(".nol-site-footer-owner");
    owner.setAttribute("data-nol-state", "Hover");
    const hovered = [getComputedStyle(owner).textDecorationLine, getComputedStyle(owner).color];
    owner.setAttribute("data-nol-state", "Focus");

    expect([...hovered, getComputedStyle(owner).outlineColor]).toEqual(["underline", color("text-strong"), color("accent")]);
  });

  for (const width of [1280, 375])
    it(`makes every target at least the pointer target in both directions on a ${width}px window, a one-letter link and the notice's link too, the notice's line keeping its height`, async () => {
      await page.viewport(width, 800);
      await renderAsync(t => t.groups.update(u => [...u, new SiteLinkGroup("Follow", [new SiteLink("X", "#x")])]));

      PointerTargetFixture.expectTargets(footer(), ["TeamRun home", "Download", "X", "Noldova"]);
      AppearanceFixture.expectPixels(box(".nol-site-footer-notice").height, Number.parseFloat(getComputedStyle(part(".nol-site-footer-notice")).lineHeight));
    });

  it("says the notice it is given under the line, with projected content under it, from the lockup's edge", async () => {
    await renderAsync(t => t.notice.set("Made by Noldova"));

    expect([part(".nol-site-footer-notice").textContent?.trim(), DomFixture.maybe(footer(), ".nol-site-footer-owner")]).toEqual(["Made by Noldova", null]);
    AppearanceFixture.expectPixels(box(".nol-site-footer-notice").top - box(".nol-site-footer-line").bottom, AppearanceFixture.measureLook("site-footer-notice-gap"));
    AppearanceFixture.expectPixels(box(".nol-site-footer-notice").left, box("nol-site-lockup").left);
    AppearanceFixture.expectPixels(box(".extra").left, box("nol-site-lockup").left);
    expect(box(".extra").top).toBeGreaterThanOrEqual(box(".nol-site-footer-notice").bottom - 1 / 32);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its insets and content width from the ${theme.id} theme in ${mode} mode, the site's gutter at each side`, async () => {
        await page.viewport(1920, 1000);
        await renderAsync(() => undefined, theme, mode);
        const inner = part(".nol-site-footer-inner");
        const style = getComputedStyle(inner);
        const inset = AppearanceFixture.measureLook("site-padding-inline");
        const width = AppearanceFixture.measureLook("site-content-width") + inset * 2;
        const groups = all(".nol-site-footer-group").map(t => t.getBoundingClientRect());

        AppearanceFixture.expectLook(style.paddingTop, theme, "site-footer-padding-block", "padding-top");
        AppearanceFixture.expectLook(style.paddingBottom, theme, "site-footer-padding-end", "padding-bottom");
        AppearanceFixture.expectLook(style.paddingLeft, theme, "site-padding-inline", "padding-left");
        AppearanceFixture.expectPixels(inner.getBoundingClientRect().width, width);
        AppearanceFixture.expectPixels(inner.getBoundingClientRect().left - edges().left, (edges().width - width) / 2);
        AppearanceFixture.expectPixels(box(".nol-site-footer-brand").top - edges().top, AppearanceFixture.measureLook("site-footer-padding-block"));
        AppearanceFixture.expectPixels(edges().bottom - Math.max(box(".nol-site-footer-brand").bottom, ...groups.map(t => t.bottom)), AppearanceFixture.measureLook("site-footer-padding-end"));
      });

  for (const theme of AppearanceFixture.themes)
    it(`puts the lockup's column at the content's start and the groups at its end, on one row, a group gap apart, with the ${theme.id} theme`, async () => {
      await page.viewport(1920, 1000);
      await renderAsync(() => undefined, theme);
      const groups = all(".nol-site-footer-group").map(t => t.getBoundingClientRect());
      const inner = part(".nol-site-footer-inner");
      const start = inner.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(inner).paddingLeft);
      const end = inner.getBoundingClientRect().right - Number.parseFloat(getComputedStyle(inner).paddingRight);

      AppearanceFixture.expectPixels(box(".nol-site-footer-brand").left, start);
      for (const group of groups)
        AppearanceFixture.expectPixels(group.top, box(".nol-site-footer-brand").top);
      AppearanceFixture.expectPixels(DomFixture.at(groups, 1).left - DomFixture.at(groups, 0).right, AppearanceFixture.measureLook("site-footer-group-gap"));
      AppearanceFixture.expectPixels(DomFixture.at(groups, 2).left - DomFixture.at(groups, 1).right, AppearanceFixture.measureLook("site-footer-group-gap"));
      AppearanceFixture.expectPixels(DomFixture.at(groups, 2).right, end);
    });

  for (const theme of AppearanceFixture.themes)
    it(`keeps the line to the ${theme.id} theme's line width, and puts each group's title and links a link gap apart, the title a space step further`, async () => {
      await page.viewport(1920, 1000);
      await renderAsync(t => t.line.set("Run a team of agents, each in its own worktree, and review what they change before it lands."), theme);
      const links = all(".nol-site-footer-link").map(t => t.getBoundingClientRect());
      const first = DomFixture.at(links, 0);
      const gap = AppearanceFixture.measureLook("site-footer-link-gap");

      AppearanceFixture.expectPixels(box(".nol-site-footer-line").width, AppearanceFixture.measureLook("site-footer-line-width"));
      AppearanceFixture.expectPixels(first.top - box(".nol-site-footer-title").bottom, AppearanceFixture.measureLook("space-2") + gap);
      AppearanceFixture.expectPixels(DomFixture.at(links, 1).top - first.bottom, gap);
    });

  it("widens to the wide content width on a documentation site", async () => {
    await page.viewport(1920, 1000);
    await renderAsync(t => t.wide.set(true));

    AppearanceFixture.expectPixels(box(".nol-site-footer-inner").width, Math.min(edges().width, AppearanceFixture.measureLook("site-content-width-wide") + AppearanceFixture.measureLook("site-padding-inline") * 2));
  });

  for (const theme of AppearanceFixture.themes)
    it(`puts the groups under the lockup's column on a phone, from its edge, a phone group gap apart, with the ${theme.id} theme's phone insets`, async () => {
      await page.viewport(375, 812);
      await renderAsync(t => t.groups.set([
        new SiteLinkGroup("Product", [new SiteLink("Download", "#download"), new SiteLink("Releases", "#releases")]),
        new SiteLinkGroup("Connect", [new SiteLink("GitHub", "#github", false, mark), new SiteLink("Privacy", "#privacy")])
      ]), theme);
      const inset = AppearanceFixture.measureLook("site-padding-inline-phone");
      const groups = all(".nol-site-footer-group").map(t => t.getBoundingClientRect());
      const links = all(".nol-site-footer-link").map(t => t.getBoundingClientRect());

      AppearanceFixture.expectPixels(box(".nol-site-footer-brand").top - edges().top, AppearanceFixture.measureLook("site-footer-padding-block-phone"));
      AppearanceFixture.expectPixels(box(".nol-site-footer-brand").left, edges().left + inset);
      AppearanceFixture.expectPixels(DomFixture.at(groups, 0).left, edges().left + inset);
      AppearanceFixture.expectPixels(DomFixture.at(groups, 0).top - box(".nol-site-footer-brand").bottom, AppearanceFixture.measureLook("site-footer-gap"));
      AppearanceFixture.expectPixels(DomFixture.at(groups, 1).top, DomFixture.at(groups, 0).top);
      AppearanceFixture.expectPixels(DomFixture.at(groups, 1).left - DomFixture.at(groups, 0).right, AppearanceFixture.measureLook("site-footer-group-gap-phone"));
      for (const link of links)
        expect(link.height).toBeGreaterThanOrEqual(AppearanceFixture.measureLook("pointer-target") - 1 / 32);
      AppearanceFixture.expectPixels(edges().bottom - Math.max(...groups.map(t => t.bottom)), AppearanceFixture.measureLook("site-footer-padding-end"));
    });

  for (const mode of AppearanceFixture.modes)
    it(`draws the wordmark and the lockup's name in LinkText under forced colors in ${mode} mode`, async () => {
      await renderAsync(() => undefined, AppearanceFixture.themes[0], mode);
      await ForcedColorsFixture.activateAsync();
      const link = ForcedColorsFixture.resolve("LinkText");

      expect([getComputedStyle(part(".nol-site-wordmark")).backgroundColor, getComputedStyle(part(".nol-site-lockup-name")).color]).toEqual([link, link]);
    });
});
