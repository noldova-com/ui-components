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

import { SiteCardGridComponent } from "../../../../src/app/components/site-card/site-card-grid.component";
import { SiteCardComponent } from "../../../../src/app/components/site-card/site-card.component";
import { SiteSectionComponent } from "../../../../src/app/components/site-section/site-section.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import type { IconName } from "../../../../src/app/models/icon-name";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [SiteCardComponent, SiteCardGridComponent, SiteSectionComponent],
  template: `
    <nol-site-section title="Features" headingId="features">
    <nol-site-card-grid>
      <nol-site-card [icon]="icon()" [index]="index()" [title]="title" [text]="text()"><div class="picture">Picture</div></nol-site-card>
      <nol-site-card icon="group" index="02" title="The right teammate." text="Give an agent a role." />
      <nol-site-card icon="difference" index="03" title="See the changes." text="Approve what they do." />
      <nol-site-card title="Take it back." [text]="null"><span nolSiteCardText>Press <kbd>Ctrl+Z</kbd> to take it back.</span><div class="picture">Second picture</div></nol-site-card>
    </nol-site-card-grid>
    </nol-site-section>
  `
})
class SiteCardHostComponent {
  public readonly title = "One chat,\nevery agent.";
  public readonly icon = signal<IconName | null>("forum");
  public readonly index = signal<string | null>("01");
  public readonly text = signal<string | null>("Each agent reads the same chat.");
}

describe("SiteCardComponent", () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let fixture: ComponentFixture<SiteCardHostComponent>;

  async function renderAsync(change: (host: SiteCardHostComponent) => void = () => undefined, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    fixture = TestBed.createComponent(SiteCardHostComponent);
    change(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const grid = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-site-card-grid");
  const cards = (): HTMLElement[] => DomFixture.all(grid(), "nol-site-card");
  const first = (): HTMLElement => DomFixture.at(cards(), 0);
  const part = (selector: string): HTMLElement => DomFixture.one(first(), selector);
  const box = (selector: string): DOMRect => part(selector).getBoundingClientRect();
  const rem = (value: number): number => AppearanceFixture.toPixels(value);
  const color = (mode: ThemeMode, key: string): string => AppearanceFixture.readColor(DefaultTheme.theme, mode, key);

  afterEach(async () => {
    AppearanceFixture.reset();
    await page.viewport(windowWidth, windowHeight);
  });

  it("draws each card as an article with its icon, index, title, text and content, the icon hidden from assistive tech", async () => {
    await renderAsync();

    expect([first().getAttribute("role"), part(".nol-site-card-icon").textContent, part(".nol-site-card-icon").getAttribute("aria-hidden"), part(".nol-site-card-index").textContent,
      part("h3").innerText, part(".nol-site-card-text").textContent, part(".picture").textContent]).toEqual([
      "article", "forum", "true", "01", "One chat,\nevery agent.", "Each agent reads the same chat.", "Picture"]);
  });

  it("starts with the title when the card has no icon, index or text", async () => {
    await renderAsync(t => {
      t.icon.set(null);
      t.index.set(null);
      t.text.set(null);
    });

    expect([DomFixture.maybe(first(), ".nol-site-card-head"), getComputedStyle(part(".nol-site-card-text")).display]).toEqual([null, "none"]);
    AppearanceFixture.expectPixels(box("h3").top - first().getBoundingClientRect().top, rem(1.6875) + 1);
  });

  for (const mode of AppearanceFixture.modes) {
    it(`draws the text a site projects, in the card text's own style and place, before the card's content, ${mode}`, async () => {
      await renderAsync(undefined, mode);
      const card = DomFixture.at(cards(), 3);
      const text = DomFixture.one(card, ".nol-site-card-text");
      const style = getComputedStyle(text);

      expect([text.textContent, DomFixture.one(text, "[nolSiteCardText]").parentElement === text, style.color, style.fontSize, style.lineHeight]).toEqual([
        "Press Ctrl+Z to take it back.", true, color(mode, "text-muted"), getComputedStyle(part(".nol-site-card-text")).fontSize, getComputedStyle(part(".nol-site-card-text")).lineHeight]);
      AppearanceFixture.expectPixels(text.getBoundingClientRect().top - DomFixture.one(card, "h3").getBoundingClientRect().bottom,
        part(".nol-site-card-text").getBoundingClientRect().top - box("h3").bottom);
      expect(DomFixture.one(card, ".picture").getBoundingClientRect().top).toBeGreaterThanOrEqual(text.getBoundingClientRect().bottom);
    });
  }

  it("keeps the row over the title when the card has only an index", async () => {
    await renderAsync(t => t.icon.set(null));

    expect([DomFixture.maybe(first(), ".nol-site-card-icon"), part(".nol-site-card-index").textContent]).toEqual([null, "01"]);
  });

  for (const mode of AppearanceFixture.modes) {
    it(`draws on the panel color with a border, the icon in the accent color, the index and text muted and the title in the title color, ${mode}`, async () => {
      await renderAsync(undefined, mode);
      const card = getComputedStyle(first());

      expect([card.backgroundColor, card.borderTopColor, card.borderTopWidth, card.borderTopLeftRadius, getComputedStyle(part(".nol-site-card-icon")).color,
        getComputedStyle(part(".nol-site-card-index")).color, getComputedStyle(part("h3")).color, getComputedStyle(part(".nol-site-card-text")).color]).toEqual([
        color(mode, "panel"), color(mode, "border"), "1px", `${rem(0.75)}px`, color(mode, "accent"), color(mode, "text-muted"), color(mode, "setting-title"), color(mode, "text-muted")]);
    });

    it(`sets the cards side by side, as tall as each other, each with its icon and index on one row over the title, at 1280 pixels, ${mode}`, async () => {
      await page.viewport(1280, 800);
      await renderAsync(undefined, mode);
      // The three data cards share the first row; the fourth wraps to the next.
      const boxes = cards().slice(0, 3).map(t => t.getBoundingClientRect());
      const card = DomFixture.at(boxes, 0);
      const icon = box(".nol-site-card-icon");

      expect(new Set(boxes.map(t => Math.round(t.top))).size).toBe(1);
      expect(new Set(boxes.map(t => Math.round(t.height))).size).toBe(1);
      AppearanceFixture.expectPixels(DomFixture.at(boxes, 1).left - card.right, rem(1.25));
      AppearanceFixture.expectPixels(icon.left - card.left, rem(1.6875) + 1);
      AppearanceFixture.expectPixels(icon.top - card.top, rem(1.6875) + 1);
      AppearanceFixture.expectPixels(icon.width, rem(1.4375));
      AppearanceFixture.expectPixels(card.right - box(".nol-site-card-index").right, rem(1.6875) + 1);
      AppearanceFixture.expectPixels(box("h3").top - box(".nol-site-card-head").bottom, rem(2.125));
      AppearanceFixture.expectPixels(box("h3").left, icon.left);
      AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(part("h3")).fontSize), rem(1.5));
    });

    it(`stacks the cards across the grid at 375 pixels, ${mode}`, async () => {
      await page.viewport(375, 800);
      await renderAsync(undefined, mode);
      const boxes = cards().map(t => t.getBoundingClientRect());
      const outer = grid().getBoundingClientRect();
      const card = DomFixture.at(boxes, 0);

      expect(boxes.every(t => Math.abs(t.width - outer.width) < 1 / 32)).toBe(true);
      AppearanceFixture.expectPixels(DomFixture.at(boxes, 1).top - card.bottom, rem(1.25));
      // The card's spacing follows the width of the section it is in.
      const section = DomFixture.one(DomFixture.host(fixture), "nol-site-section").getBoundingClientRect();
      AppearanceFixture.expectPixels(box(".nol-site-card-icon").left - card.left, Math.min(rem(1.5625), section.width * 0.06) + 1);
      AppearanceFixture.expectPixels(box("h3").top - box(".nol-site-card-head").bottom, rem(1.5));
      AppearanceFixture.expectPixels(Number.parseFloat(getComputedStyle(part("h3")).fontSize), rem(1.6875));
    });
  }
});
