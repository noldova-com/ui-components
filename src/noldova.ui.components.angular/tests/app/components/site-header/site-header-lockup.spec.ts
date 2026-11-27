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

import { SiteHeaderComponent } from "../../../../src/app/components/site-header/site-header.component";
import { SiteWordmarkSize } from "../../../../src/app/enums/site-wordmark-size";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

// A product's own wordmark four times as wide as high, a reference wordmark in the proportions the large size is set by,
// a longer one, and an icon with no text in it.
const ratio = 4;
const wordmark = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 200'%3E%3Crect width='800' height='200'/%3E%3C/svg%3E";
const longRatio = 1708.818 / 201.396;
const referenceWordmark = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1335.64 201.396'%3E%3Crect width='1335.64' height='201.396'/%3E%3C/svg%3E`;
const longWordmark = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1708.818 201.396'%3E%3Crect width='1708.818' height='201.396'/%3E%3C/svg%3E`;
const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1'/%3E%3C/svg%3E";

@Component({
  imports: [SiteHeaderComponent],
  template: `<nol-site-header [wordmark]="wordmark()" [wordmarkRatio]="ratio()" [icon]="icon()" [name]="name()" [homeLabel]="homeLabel()" [wordmarkSize]="size()" />`
})
class SiteHeaderLockupHostComponent {
  public readonly wordmark = signal(wordmark);
  public readonly ratio = signal(ratio);
  public readonly icon = signal<string | null>(icon);
  public readonly name = signal<string | null>(null);
  public readonly homeLabel = signal<string | null>("Example home");
  public readonly size = signal(SiteWordmarkSize.Large);
}

// The reference wordmark's proportions, by which a large wordmark takes its height: the height the reference wordmark has
// at its width for the header's width.
const referenceRatio = 1335.64 / 201.396;

// A window width, the reference wordmark's width in a header that wide, and the height in rem that gives any large wordmark.
class LargeWidth {
  public readonly width: number;
  public readonly referenceWidth: number;
  public readonly height: number;

  public constructor(width: number, referenceWidth: number) {
    this.width = width;
    this.referenceWidth = referenceWidth;
    this.height = referenceWidth / referenceRatio;
  }
}

describe("SiteHeaderComponent's lockup", () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let fixture: ComponentFixture<SiteHeaderLockupHostComponent>;

  async function renderAsync(change: (host: SiteHeaderLockupHostComponent) => void = () => undefined): Promise<void> {
    await renderInAsync(ThemeMode.Light, change);
  }

  async function renderInAsync(mode: ThemeMode, change: (host: SiteHeaderLockupHostComponent) => void = () => undefined): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    fixture = TestBed.createComponent(SiteHeaderLockupHostComponent);
    change(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.all(DomFixture.allOf(DomFixture.host(fixture), "img", HTMLImageElement).map(t => t.decode()));
  }

  const header = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-site-header");
  const link = (): HTMLAnchorElement => DomFixture.oneOf(header(), ".nol-site-lockup-link", HTMLAnchorElement);
  const mark = (): DOMRect => DomFixture.one(header(), ".nol-site-wordmark").getBoundingClientRect();
  const rem = (value: number): number => AppearanceFixture.toPixels(value);

  afterEach(async () => {
    AppearanceFixture.reset();
    await page.viewport(windowWidth, windowHeight);
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws the wordmark in the setting title color and the product's name in the strong text color in ${mode} mode`, async () => {
      await renderInAsync(mode, t => t.name.set("Example"));

      expect([getComputedStyle(DomFixture.one(header(), ".nol-site-wordmark")).backgroundColor, getComputedStyle(DomFixture.one(header(), ".nol-site-lockup-name")).color])
        .toEqual([AppearanceFixture.readColor(DefaultTheme.theme, mode, "setting-title"), AppearanceFixture.readColor(DefaultTheme.theme, mode, "text-strong")]);
    });

  it("names the home link with the label the site gives, such as a documentation site's", async () => {
    await renderAsync(t => {
      t.icon.set(null);
      t.name.set("UI Components");
      t.homeLabel.set("UI Components docs home");
    });

    expect([link().getAttribute("aria-label"), DomFixture.one(header(), ".nol-site-lockup-name").textContent?.trim()]).toEqual(["UI Components docs home", "UI Components"]);
  });

  it("names the home link from the product's name when the site gives no label", async () => {
    await renderAsync(t => {
      t.name.set("Exampleware");
      t.homeLabel.set(null);
    });

    expect(link().getAttribute("aria-label")).toBe("Exampleware home");
  });

  it("draws an icon and a product's own wordmark without the name a second time, its link named by the label", async () => {
    await renderAsync();
    const iconBox = DomFixture.one(header(), ".nol-site-lockup-icon").getBoundingClientRect();

    expect([DomFixture.maybe(header(), ".nol-site-lockup-name"), link().getAttribute("aria-label"), link().textContent?.trim()]).toEqual([null, "Example home", ""]);
    AppearanceFixture.expectPixels(mark().left - iconBox.right, rem(0.75));
  });

  for (const size of [new LargeWidth(1280, 9.125), new LargeWidth(761, 9.125), new LargeWidth(760, 8.25), new LargeWidth(375, 8.25), new LargeWidth(361, 8.25), new LargeWidth(360, 7)]) {
    it(`draws a large wordmark as high as the reference wordmark ${size.referenceWidth}rem wide, in its file's proportions, the icon's top and bottom on its own, in a header ${size.width} pixels wide`, async () => {
      await page.viewport(size.width, 800);
      await renderAsync();

      AppearanceFixture.expectPixels(header().getBoundingClientRect().width, size.width);
      AppearanceFixture.expectPixels(mark().height, rem(size.height));
      AppearanceFixture.expectPixels(mark().width, rem(size.height) * ratio);
      AppearanceFixture.expectPixels(DomFixture.one(header(), ".nol-site-lockup-icon").getBoundingClientRect().top, mark().top);
      AppearanceFixture.expectPixels(DomFixture.one(header(), ".nol-site-lockup-icon").getBoundingClientRect().bottom, mark().bottom);
    });
  }

  for (const size of [new LargeWidth(1280, 9.125), new LargeWidth(760, 8.25), new LargeWidth(360, 7)]) {
    it(`draws the reference wordmark ${size.referenceWidth}rem wide in a header ${size.width} pixels wide`, async () => {
      await page.viewport(size.width, 800);
      await renderAsync(t => {
        t.wordmark.set(referenceWordmark);
        t.ratio.set(referenceRatio);
      });

      AppearanceFixture.expectPixels(mark().width, rem(size.referenceWidth));
      AppearanceFixture.expectPixels(mark().height, rem(size.height));
    });
  }

  it("draws a small wordmark at the wordmark height at any width", async () => {
    for (const width of [1280, 360]) {
      await page.viewport(width, 800);
      await renderAsync(t => t.size.set(SiteWordmarkSize.Small));

      AppearanceFixture.expectPixels(mark().height, AppearanceFixture.measureLook("site-wordmark"));
    }
  });

  it("keeps a short large wordmark's full width beside the icon as the header narrows, with the theme switch beside it in the bar, the phone's gap apart", async () => {
    await page.viewport(360, 800);
    await renderAsync();
    const lockup = DomFixture.one(header(), "nol-site-lockup").getBoundingClientRect();
    const theme = DomFixture.one(header(), "nol-site-theme-switch").getBoundingClientRect();

    expect(lockup.width).toBeGreaterThanOrEqual(rem(1.75) + rem(0.75) + rem(7 / referenceRatio) * ratio - 1 / 32);
    AppearanceFixture.expectPixels(mark().width, rem(7 / referenceRatio) * ratio);
    expect([theme.width > 0, theme.left - lockup.right >= AppearanceFixture.measureLook("site-actions-gap-phone") - 1 / 32]).toEqual([true, true]);
  });

  for (const width of [360, 320]) {
    it(`keeps a long wordmark whole, at its height in its file's proportions, the phone's gap before the menu button, with the theme switch in the menu, in a header ${width} pixels wide`, async () => {
      await page.viewport(width, 800);
      await renderAsync(t => {
        t.wordmark.set(longWordmark);
        t.ratio.set(longRatio);
      });
      const lockup = DomFixture.one(header(), "nol-site-lockup").getBoundingClientRect();
      const menu = DomFixture.one(header(), ".nol-site-menu-button").getBoundingClientRect();
      const gap = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nol-site-actions-gap-phone"));

      expect(getComputedStyle(DomFixture.one(header(), "nol-site-theme-switch")).display).toBe("none");
      expect(menu.left - lockup.right).toBeGreaterThanOrEqual(rem(gap) - 1 / 32);
      expect(mark().right).toBeLessThanOrEqual(lockup.right + 1 / 32);
      AppearanceFixture.expectPixels(mark().height, rem(7 / referenceRatio));
      AppearanceFixture.expectPixels(mark().width, rem(7 / referenceRatio) * longRatio);
      expect(getComputedStyle(DomFixture.one(header(), ".nol-site-wordmark")).maskSize).toBe("contain");
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(document.documentElement.clientWidth);
    });
  }
});
