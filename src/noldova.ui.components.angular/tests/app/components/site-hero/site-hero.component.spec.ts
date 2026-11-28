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

import { SiteHeroComponent } from "../../../../src/app/components/site-hero/site-hero.component";
import { ButtonVariant } from "../../../../src/app/enums/button-variant";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { SiteAction } from "../../../../src/app/models/site-action";
import { SiteShot } from "../../../../src/app/models/site-shot";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { EmulatedMediaFixture } from "../../../fixtures/emulated-media.fixture";

const pixel = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1438 1022'%3E%3Crect width='1438' height='1022'/%3E%3C/svg%3E";

@Component({
  imports: [SiteHeroComponent],
  template: `
    <nol-site-hero [eyebrow]="eyebrow()" title="Your AI agents," [accent]="accent()" [closing]="closing()" [actions]="actions()" [shot]="shot()" shotId="product"
      >Put your agents in the same chat.</nol-site-hero
    >
  `
})
class SiteHeroHostComponent {
  public readonly eyebrow = signal<string | null>("Your agents. One team.");
  public readonly accent = signal<string | null>("working as one team.");
  public readonly closing = signal<string | null>("Less copying between agents.\nMore work done.");
  public readonly actions = signal<readonly SiteAction[]>([
    new SiteAction("Download TeamRun", "/download/", "download"),
    new SiteAction("Get started", "/docs/", "keyboard_arrow_right", ButtonVariant.Secondary)
  ]);
  public readonly shot = signal<SiteShot | null>(new SiteShot(pixel, `${pixel}#dark`, 1438, 1022, "The product at work.", `${pixel}#light-2x`, `${pixel}#dark-2x`));
}

// A width the hero is drawn at, and the rem sizes its layout takes there.
class HeroWidth {
  public readonly name: string;
  public readonly width: number;
  public readonly gutter: number;
  public readonly paddingTop: number;
  public readonly actionsGap: number;
  public readonly actionsTop: number;

  public constructor(name: string, width: number, gutter: number, paddingTop: number, actionsGap: number, actionsTop: number) {
    this.name = name;
    this.width = width;
    this.gutter = gutter;
    this.paddingTop = paddingTop;
    this.actionsGap = actionsGap;
    this.actionsTop = actionsTop;
  }
}

describe("SiteHeroComponent", () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let fixture: ComponentFixture<SiteHeroHostComponent>;

  async function renderAsync(change: (host: SiteHeroHostComponent) => void = () => undefined, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    // A site marks the mode its visitor chose on the root, as its theme switch does.
    document.documentElement.setAttribute("data-nol-theme-mode", mode);
    fixture = TestBed.createComponent(SiteHeroHostComponent);
    change(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const hero = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-site-hero");
  const part = (selector: string): HTMLElement => DomFixture.one(hero(), selector);
  const box = (selector: string): DOMRect => part(selector).getBoundingClientRect();
  const rem = (value: number): number => AppearanceFixture.toPixels(value);
  const color = (mode: ThemeMode, key: string): string => AppearanceFixture.readColor(DefaultTheme.theme, mode, key);

  afterEach(async () => {
    AppearanceFixture.reset();
    document.documentElement.removeAttribute("data-nol-theme-mode");
    await EmulatedMediaFixture.resetAsync();
    await page.viewport(windowWidth, windowHeight);
  });

  it("draws the line above, the headline with its accent line, the side text with its closing words, the actions and the shot", async () => {
    await renderAsync();
    const title = part("h1");
    const links = DomFixture.all(hero(), "a[nol-button]");
    const images = DomFixture.allOf(hero(), "img", HTMLImageElement);

    expect([part("section").getAttribute("aria-labelledby"), title.id, title.textContent, part(".nol-site-hero-accent").textContent]).toEqual([
      "nol-site-hero-title", "nol-site-hero-title", "Your AI agents,working as one team.", "working as one team."]);
    expect([part(".nol-site-eyebrow").textContent?.trim(), part(".nol-site-hero-copy").textContent, part(".nol-site-hero-closing").innerText]).toEqual([
      "Your agents. One team.", "Put your agents in the same chat.Less copying between agents.\nMore work done.", "Less copying between agents.\nMore work done."]);
    expect(links.map(t => [t.textContent, t.getAttribute("href"), t.classList.contains("nol-button-secondary")])).toEqual([
      ["Download TeamRundownload", "/download/", false], ["Get startedkeyboard_arrow_right", "/docs/", true]]);
    expect(DomFixture.all(hero(), ".nol-site-hero-action-icon").map(t => t.getAttribute("aria-hidden"))).toEqual(["true", "true"]);
    expect(part(".nol-site-hero-shot").id).toBe("product");
    expect(images.map(t => [t.getAttribute("srcset"), t.alt, t.getAttribute("width"), t.getAttribute("height"), t.loading])).toEqual([
      [`${pixel} 1438w, ${pixel}#light-2x 2876w`, "The product at work.", "1438", "1022", "lazy"],
      [`${pixel}#dark 1438w, ${pixel}#dark-2x 2876w`, "The product at work.", "1438", "1022", "lazy"]]);
    expect(images.map(t => t.getAttribute("sizes"))).toEqual([
      "(max-width: 47.5em) calc(100vw - 2.5rem), min(75rem, calc(100vw - 5rem))", "(max-width: 47.5em) calc(100vw - 2.5rem), min(75rem, calc(100vw - 5rem))"]);
  });

  it("lists each shot alone when it has no larger file", async () => {
    await renderAsync(t => t.shot.set(new SiteShot(pixel, `${pixel}#dark`, 1438, 1022, "The product.")));

    expect(DomFixture.allOf(hero(), "img", HTMLImageElement).map(t => t.getAttribute("srcset"))).toEqual([`${pixel} 1438w`, `${pixel}#dark 1438w`]);
  });

  it("draws the headline alone, with nothing above, beside or under it, when it has nothing else", async () => {
    await renderAsync(t => {
      t.eyebrow.set(null);
      t.accent.set(null);
      t.closing.set(null);
      t.actions.set([]);
      t.shot.set(null);
    });

    expect([".nol-site-eyebrow", ".nol-site-hero-accent", ".nol-site-hero-closing", ".nol-site-hero-actions", ".nol-site-hero-shot"].map(t => DomFixture.maybe(hero(), t)))
      .toEqual([null, null, null, null, null]);
    expect(part("h1").textContent).toBe("Your AI agents,");
  });

  for (const scheme of ["light", "dark"]) {
    it(`shows the ${scheme} theme's shot when the page sets no mode and the system's scheme is ${scheme}`, async () => {
      await EmulatedMediaFixture.emulateAsync("prefers-color-scheme", scheme);
      await renderAsync();
      document.documentElement.removeAttribute("data-nol-theme-mode");
      const shown = DomFixture.all(hero(), ".nol-site-hero-shot-frame").filter(t => getComputedStyle(t).display !== "none");

      expect(shown.map(t => DomFixture.one(t, "img").getAttribute("src"))).toEqual([scheme === "dark" ? `${pixel}#dark` : pixel]);
    });
  }

  for (const mode of AppearanceFixture.modes) {
    it(`draws the line above in the accent color in spaced monospace capitals, the headline in the title color with its second line in the accent color, and the side text muted with its closing words in the text color, ${mode}`, async () => {
      await renderAsync(undefined, mode);
      const eyebrow = getComputedStyle(part(".nol-site-eyebrow"));

      expect([eyebrow.color, eyebrow.textTransform, eyebrow.fontFamily, getComputedStyle(part("h1")).color, getComputedStyle(part(".nol-site-hero-accent")).color,
        getComputedStyle(part(".nol-site-hero-copy")).color, getComputedStyle(part(".nol-site-hero-closing")).color]).toEqual([
        color(mode, "accent"), "uppercase", getComputedStyle(document.documentElement).getPropertyValue("--nol-font-mono").trim(), color(mode, "setting-title"),
        color(mode, "accent"), color(mode, "text-muted"), color(mode, "text")]);
    });

    it(`shows the shot of the theme the page sets, ${mode}`, async () => {
      await renderAsync(undefined, mode);
      const shown = mode === ThemeMode.Dark ? ".nol-site-hero-shot-dark" : ".nol-site-hero-shot-light";
      const hidden = mode === ThemeMode.Dark ? ".nol-site-hero-shot-light" : ".nol-site-hero-shot-dark";

      expect([getComputedStyle(part(shown)).display, getComputedStyle(part(hidden)).display]).toEqual(["block", "none"]);
    });

    for (const size of [new HeroWidth("1280 pixels", 1280, 2.5, 4.3125, 1, 1.9375), new HeroWidth("375 pixels", 375, 1.25, 2.6875, 0.75, 1.5)]) {
      it(`keeps to the site's content width with the headline, side text, actions and shot in their places at ${size.name}, ${mode}`, async () => {
        await page.viewport(size.width, 800);
        await renderAsync(undefined, mode);
        const outer = hero().getBoundingClientRect();
        const intro = box("section");
        const title = box("h1");
        const copy = box(".nol-site-hero-copy");
        const actions = DomFixture.all(hero(), "a[nol-button]").map(t => t.getBoundingClientRect());
        const shot = box(mode === ThemeMode.Dark ? ".nol-site-hero-shot-dark" : ".nol-site-hero-shot-light");
        const first = DomFixture.at(actions, 0);
        const second = DomFixture.at(actions, 1);

        AppearanceFixture.expectPixels(intro.width, Math.min(rem(75), outer.width - 2 * rem(size.gutter)));
        AppearanceFixture.expectPixels(intro.left - outer.left, outer.right - intro.right);
        AppearanceFixture.expectPixels(box(".nol-site-eyebrow").top - intro.top, rem(size.paddingTop));
        AppearanceFixture.expectPixels(title.left, intro.left);
        AppearanceFixture.expectPixels(first.left, intro.left);
        AppearanceFixture.expectPixels(first.height, rem(2.5));
        AppearanceFixture.expectPixels(first.top - box(".nol-site-hero-grid").bottom, rem(size.actionsTop));
        if (size.width > 420) {
          AppearanceFixture.expectPixels(copy.width, rem(18.75));
          AppearanceFixture.expectPixels(copy.left - title.right, rem(3));
          AppearanceFixture.expectPixels(copy.right, intro.right);
          AppearanceFixture.expectPixels(second.left - first.right, rem(size.actionsGap));
        } else {
          AppearanceFixture.expectPixels(copy.top - title.bottom, rem(1.4375));
          AppearanceFixture.expectPixels(copy.left, intro.left);
          AppearanceFixture.expectPixels(second.top - first.bottom, rem(size.actionsGap));
          expect(getComputedStyle(part(".nol-site-hero-closing")).display).toBe("none");
        }
        AppearanceFixture.expectPixels(shot.left, intro.left);
        AppearanceFixture.expectPixels(shot.width, intro.width);
        AppearanceFixture.expectPixels(shot.top - intro.bottom, 0);
        AppearanceFixture.expectPixels(shot.height, (shot.width - 2) * 1022 / 1438 + 2);
      });
    }
  }
});
