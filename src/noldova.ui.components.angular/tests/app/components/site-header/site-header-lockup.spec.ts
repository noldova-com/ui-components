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
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

// A product's own wordmark, in the proportions of Commitline's, and an icon with no text in it.
const ratio = 1708.818 / 201.396;
const wordmark = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1708.818 201.396'%3E%3Crect width='1708.818' height='201.396'/%3E%3C/svg%3E`;
const icon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1'/%3E%3C/svg%3E";

@Component({
  imports: [SiteHeaderComponent],
  template: `<nol-site-header [wordmark]="wordmark" [wordmarkRatio]="ratio" [icon]="icon()" [name]="name()" [homeLabel]="homeLabel()" [wordmarkSize]="size()" />`
})
class SiteHeaderLockupHostComponent {
  public readonly wordmark: string = wordmark;
  public readonly ratio: number = ratio;
  public readonly icon = signal<string | null>(icon);
  public readonly name = signal<string | null>(null);
  public readonly homeLabel = signal<string | null>("Commitline home");
  public readonly size = signal(SiteWordmarkSize.Large);
}

// A window width and the wordmark height a large wordmark takes in a header that wide.
class LargeWidth {
  public readonly width: number;
  public readonly height: number;

  public constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }
}

describe("SiteHeaderComponent's lockup", () => {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  let fixture: ComponentFixture<SiteHeaderLockupHostComponent>;

  async function renderAsync(change: (host: SiteHeaderLockupHostComponent) => void = () => undefined): Promise<void> {
    AppearanceFixture.apply(AppearanceFixture.themes[0], AppearanceFixture.modes[0]);
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
    await page.viewport(viewport.width, viewport.height);
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
      t.name.set("TeamRun");
      t.homeLabel.set(null);
    });

    expect(link().getAttribute("aria-label")).toBe("TeamRun home");
  });

  it("draws an icon and a product's own wordmark without the name a second time, its link named by the label", async () => {
    await renderAsync();
    const iconBox = DomFixture.one(header(), ".nol-site-lockup-icon").getBoundingClientRect();

    expect([DomFixture.maybe(header(), ".nol-site-lockup-name"), link().getAttribute("aria-label"), link().textContent?.trim()]).toEqual([null, "Commitline home", ""]);
    AppearanceFixture.expectPixels(mark().left - iconBox.right, rem(0.75));
  });

  for (const size of [new LargeWidth(1280, 1.375), new LargeWidth(761, 1.375), new LargeWidth(760, 1.25), new LargeWidth(375, 1.25), new LargeWidth(361, 1.25), new LargeWidth(360, 1.0625)]) {
    it(`draws a large wordmark ${size.height}rem high, in its file's proportions, in a header ${size.width} pixels wide`, async () => {
      await page.viewport(size.width, 800);
      await renderAsync();

      AppearanceFixture.expectPixels(header().getBoundingClientRect().width, size.width);
      AppearanceFixture.expectPixels(mark().height, rem(size.height));
      AppearanceFixture.expectPixels(mark().width, rem(size.height) * ratio);
    });
  }

  it("draws a small wordmark at the wordmark height at any width", async () => {
    for (const width of [1280, 360]) {
      await page.viewport(width, 800);
      await renderAsync(t => t.size.set(SiteWordmarkSize.Small));

      AppearanceFixture.expectPixels(mark().height, AppearanceFixture.measureLook("site-wordmark"));
    }
  });

  it("keeps a large wordmark's full width beside the icon as the header narrows", async () => {
    await page.viewport(360, 800);
    await renderAsync();
    const lockup = DomFixture.one(header(), "nol-site-lockup").getBoundingClientRect();

    expect(lockup.width).toBeGreaterThanOrEqual(rem(1.75) + rem(0.75) + rem(1.0625) * ratio - 1 / 32);
  });
});
