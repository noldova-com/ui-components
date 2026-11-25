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

import { SiteSectionComponent } from "../../../../src/app/components/site-section/site-section.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [SiteSectionComponent],
  template: `
    <nol-site-section [eyebrow]="eyebrow()" [title]="title()" [copy]="copy()" headingId="workflow-title" [sectionId]="sectionId()"><div class="body">Body</div></nol-site-section>
  `
})
class SiteSectionHostComponent {
  public readonly eyebrow = signal<string | null>("One team. Your rules.");
  public readonly title = signal("Agents that work together,\nwith you in charge.");
  public readonly copy = signal<string | null>("From the first question to the final review,\nevery step stays in front of you.");
  public readonly sectionId = signal<string | null>("workflow");
}

describe("SiteSectionComponent", () => {
  const viewport = { width: window.innerWidth, height: window.innerHeight };
  let fixture: ComponentFixture<SiteSectionHostComponent>;

  async function renderAsync(change: (host: SiteSectionHostComponent) => void = () => undefined, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    fixture = TestBed.createComponent(SiteSectionHostComponent);
    change(fixture.componentInstance);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  const section = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-site-section");
  const part = (selector: string): HTMLElement => DomFixture.one(section(), selector);
  const box = (selector: string): DOMRect => part(selector).getBoundingClientRect();
  const rem = (value: number): number => AppearanceFixture.toPixels(value);
  const color = (mode: ThemeMode, key: string): string => AppearanceFixture.readColor(DefaultTheme.theme, mode, key);

  afterEach(async () => {
    AppearanceFixture.reset();
    await page.viewport(viewport.width, viewport.height);
  });

  it("is a region named by its title, with its id, the line above, the copy beside and the content under them", async () => {
    await renderAsync();
    const block = part("section");

    expect([block.id, block.getAttribute("aria-labelledby"), part("h2").id, part("h2").innerText, part(".nol-site-eyebrow").textContent?.trim()]).toEqual([
      "workflow", "workflow-title", "workflow-title", "Agents that work together,\nwith you in charge.", "One team. Your rules."]);
    expect(DomFixture.all(section(), ".nol-site-section-copy-line").map(t => t.textContent)).toEqual([
      "From the first question to the final review,", "every step stays in front of you."]);
    expect(part(".body").getBoundingClientRect().top).toBeGreaterThan(box(".nol-site-section-heading").bottom);
  });

  it("draws the title alone, with no id, line above or copy, when it has none", async () => {
    await renderAsync(t => {
      t.eyebrow.set(null);
      t.copy.set(null);
      t.sectionId.set(null);
    });

    expect([part("section").hasAttribute("id"), DomFixture.maybe(section(), ".nol-site-eyebrow"), DomFixture.maybe(section(), ".nol-site-section-copy")]).toEqual([false, null, null]);
  });

  for (const mode of AppearanceFixture.modes) {
    it(`draws the line above in the accent color, the title in the title color and the copy muted, ${mode}`, async () => {
      await renderAsync(undefined, mode);

      expect([getComputedStyle(part(".nol-site-eyebrow")).color, getComputedStyle(part("h2")).color, getComputedStyle(part(".nol-site-section-copy")).color]).toEqual([
        color(mode, "accent"), color(mode, "setting-title"), color(mode, "text-muted")]);
    });

    it(`keeps to the content width with the copy beside the title, at its foot, and the content under them at 1280 pixels, ${mode}`, async () => {
      await page.viewport(1280, 800);
      await renderAsync(undefined, mode);
      const outer = section().getBoundingClientRect();
      const block = box("section");
      const title = box("h2");
      const copy = box(".nol-site-section-copy");
      const lines = DomFixture.all(section(), ".nol-site-section-copy-line").map(t => t.getBoundingClientRect());

      AppearanceFixture.expectPixels(block.width, Math.min(rem(75), outer.width - 2 * rem(2.5)));
      AppearanceFixture.expectPixels(box(".nol-site-eyebrow").top - block.top, rem(6.875));
      AppearanceFixture.expectPixels(block.bottom - part(".body").getBoundingClientRect().bottom, rem(6.875));
      AppearanceFixture.expectPixels(title.left, block.left);
      AppearanceFixture.expectPixels(copy.right, block.right);
      expect(copy.left - title.right).toBeGreaterThanOrEqual(rem(1.875) - 1 / 32);
      AppearanceFixture.expectPixels(title.bottom - (copy.bottom + rem(0.25)), 0);
      expect(DomFixture.at(lines, 1).top).toBeGreaterThan(DomFixture.at(lines, 0).top);
      AppearanceFixture.expectPixels(part(".body").getBoundingClientRect().top - title.bottom, rem(2.625));
    });

    it(`puts the copy under the title, its lines running on, at 375 pixels, ${mode}`, async () => {
      await page.viewport(375, 800);
      await renderAsync(undefined, mode);
      const outer = section().getBoundingClientRect();
      const block = box("section");
      const copy = box(".nol-site-section-copy");

      AppearanceFixture.expectPixels(block.width, outer.width - 2 * rem(1.25));
      AppearanceFixture.expectPixels(box(".nol-site-eyebrow").top - block.top, rem(4.375));
      AppearanceFixture.expectPixels(copy.top - box("h2").bottom, rem(1.4375));
      AppearanceFixture.expectPixels(copy.left, block.left);
      expect(part(".nol-site-section-copy").innerText).toBe("From the first question to the final review, every step stays in front of you.");
      AppearanceFixture.expectPixels(part(".body").getBoundingClientRect().top - (copy.bottom + rem(0.25)), rem(1.8125));
    });
  }
});
