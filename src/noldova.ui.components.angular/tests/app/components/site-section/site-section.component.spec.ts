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
import { SiteShot } from "../../../../src/app/models/site-shot";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { EmulatedMediaFixture } from "../../../fixtures/emulated-media.fixture";

const pixel = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1438 1022'%3E%3Crect width='1438' height='1022'/%3E%3C/svg%3E";
const productShot = new SiteShot(pixel, `${pixel}#dark`, 1438, 1022, "A message to the team.", `${pixel}#light-2x`, `${pixel}#dark-2x`);

@Component({
  imports: [SiteSectionComponent],
  template: `
    <nol-site-section [eyebrow]="eyebrow()" [title]="title()" [copy]="copy()" headingId="workflow-title" [sectionId]="sectionId()" [shot]="shot()"
      ><div class="body">Body</div></nol-site-section
    >
  `
})
class SiteSectionHostComponent {
  public readonly eyebrow = signal<string | null>("One team. Your rules.");
  public readonly title = signal("Agents that work together,\nwith you in charge.");
  public readonly copy = signal<string | null>("From the first question to the final review,\nevery step stays in front of you.");
  public readonly sectionId = signal<string | null>("workflow");
  public readonly shot = signal<SiteShot | null>(null);
}

// A section with a shot and no content of its own.
@Component({
  imports: [SiteSectionComponent],
  template: `<nol-site-section title="Agents that work together." copy="Every step stays in front of you." headingId="shot-title" [shot]="shot" />`
})
class SiteSectionShotHostComponent {
  public readonly shot = productShot;
}

// A width the section is drawn at, and the rem sizes its layout takes there.
class SectionWidth {
  public readonly width: number;
  public readonly gutter: number;
  public readonly space: number;
  public readonly contentGap: number;

  public constructor(width: number, gutter: number, space: number, contentGap: number) {
    this.width = width;
    this.gutter = gutter;
    this.space = space;
    this.contentGap = contentGap;
  }
}

// The same section with its copy projected, its lines marked as the section marks its own and holding markup of their own.
@Component({
  imports: [SiteSectionComponent],
  template: `
    <nol-site-section title="Agents that work together,
with you in charge." headingId="projected-title"><span nolSiteSectionCopy><span class="nol-site-section-copy-line">From the first question to the <span class="key">final</span> review,</span><span class="nol-site-section-copy-line">every step stays in front of you.</span></span><div class="body">Body</div></nol-site-section>
  `
})
class SiteSectionProjectedHostComponent {}

// What a section's copy shows: the paragraph, its rendered text, each line's display and separator, and the boxes of the
// paragraph, each line and the content, from the section's block.
class CopyReading {
  public readonly copy: HTMLElement;
  public readonly text: string;
  public readonly lines: readonly (readonly string[])[];
  public readonly places: readonly (readonly number[])[];

  public constructor(copy: HTMLElement, text: string, lines: readonly (readonly string[])[], places: readonly (readonly number[])[]) {
    this.copy = copy;
    this.text = text;
    this.lines = lines;
    this.places = places;
  }
}

describe("SiteSectionComponent", () => {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  let fixture: ComponentFixture<SiteSectionHostComponent>;

  async function renderAsync(change: (host: SiteSectionHostComponent) => void = () => undefined, mode: ThemeMode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(DefaultTheme.theme, mode);
    // A site marks the mode its visitor chose on the root, as its theme switch does.
    document.documentElement.setAttribute("data-nol-theme-mode", mode);
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
    document.documentElement.removeAttribute("data-nol-theme-mode");
    await EmulatedMediaFixture.resetAsync();
    await page.viewport(windowWidth, windowHeight);
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

    expect([part("section").hasAttribute("id"), DomFixture.maybe(section(), ".nol-site-eyebrow"), DomFixture.maybe(section(), ".nol-site-section-copy-line")]).toEqual([false, null, null]);
    expect([part(".nol-site-section-copy").childElementCount, getComputedStyle(part(".nol-site-section-copy")).display]).toEqual([0, "none"]);
    expect([DomFixture.maybe(section(), ".nol-site-section-shot"), DomFixture.maybe(section(), "img")]).toEqual([null, null]);
  });

  it("draws the shot under the content, each theme's image with its larger file, the shell's width, its size and alt text, loaded lazily", async () => {
    await renderAsync(t => t.shot.set(productShot));
    const images = DomFixture.allOf(section(), "img", HTMLImageElement);

    expect(part(".body").nextElementSibling).toBe(part(".nol-site-section-shot"));
    expect(images.map(t => [t.getAttribute("srcset"), t.alt, t.getAttribute("width"), t.getAttribute("height"), t.loading, t.decoding])).toEqual([
      [`${pixel} 1438w, ${pixel}#light-2x 2876w`, "A message to the team.", "1438", "1022", "lazy", "async"],
      [`${pixel}#dark 1438w, ${pixel}#dark-2x 2876w`, "A message to the team.", "1438", "1022", "lazy", "async"]]);
    expect(images.map(t => t.getAttribute("sizes"))).toEqual([
      "(max-width: 47.5em) calc(100vw - 2.5rem), min(75rem, calc(100vw - 5rem))", "(max-width: 47.5em) calc(100vw - 2.5rem), min(75rem, calc(100vw - 5rem))"]);
  });

  it("lists each shot alone when it has no larger file", async () => {
    await renderAsync(t => t.shot.set(new SiteShot(pixel, `${pixel}#dark`, 1438, 1022, "A message.")));

    expect(DomFixture.allOf(section(), "img", HTMLImageElement).map(t => t.getAttribute("srcset"))).toEqual([`${pixel} 1438w`, `${pixel}#dark 1438w`]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const width of [1280, 375])
      it(`draws projected copy, with its markup, where and as the string copy is at ${String(width)} pixels, ${mode}`, async () => {
        await page.viewport(width, 800);
        const read = (root: HTMLElement): CopyReading => {
          const block = DomFixture.one(root, "section").getBoundingClientRect();
          const copy = DomFixture.one(root, ".nol-site-section-copy");
          const lines = DomFixture.all(root, ".nol-site-section-copy-line");
          const places = [copy, ...lines, DomFixture.one(root, ".body")].map(t => {
            const box = t.getBoundingClientRect();
            return [box.left - block.left, box.top - block.top, box.width, box.height];
          });
          return new CopyReading(copy, copy.innerText, lines.map(t => [getComputedStyle(t).display, getComputedStyle(t, "::before").content]), places);
        };
        await renderAsync(t => t.eyebrow.set(null), mode);
        const own = read(section());
        fixture.destroy();
        const projected = TestBed.createComponent(SiteSectionProjectedHostComponent);
        projected.detectChanges();
        await projected.whenStable();
        const other = read(DomFixture.one(DomFixture.host(projected), "nol-site-section"));

        expect([DomFixture.one(other.copy, "[nolSiteSectionCopy]").parentElement === other.copy, DomFixture.one(other.copy, ".key").textContent, other.text, getComputedStyle(other.copy).color])
          .toEqual([true, "final", own.text, color(mode, "text-muted")]);
        expect(other.lines).toEqual(own.lines);
        for (const [index, place] of other.places.entries())
          for (const [axis, value] of place.entries())
            AppearanceFixture.expectPixels(value, DomFixture.at(DomFixture.at(own.places, index), axis));
        projected.destroy();
      });

  for (const scheme of ["light", "dark"]) {
    it(`shows the ${scheme} theme's shot when the page sets no mode and the system's scheme is ${scheme}`, async () => {
      await EmulatedMediaFixture.emulateAsync("prefers-color-scheme", scheme);
      await renderAsync(t => t.shot.set(productShot));
      document.documentElement.removeAttribute("data-nol-theme-mode");
      const shown = DomFixture.all(section(), ".nol-site-section-shot-frame").filter(t => getComputedStyle(t).display !== "none");

      expect(shown.map(t => DomFixture.one(t, "img").getAttribute("src"))).toEqual([scheme === "dark" ? `${pixel}#dark` : pixel]);
    });
  }

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
      const lines = DomFixture.all(section(), ".nol-site-section-copy-line");
      expect(lines.map(t => [getComputedStyle(t).display, getComputedStyle(t, "::before").content])).toEqual([["inline", "none"], ["inline", '" "']]);
      // The copy's own space under it falls within the heading's, as on a page.
      AppearanceFixture.expectPixels(part(".body").getBoundingClientRect().top - copy.bottom, rem(1.8125));
    });

    it(`shows the shot of the theme the page sets, framed by the border line with the parts' radius on the site's surface, ${mode}`, async () => {
      await renderAsync(t => t.shot.set(productShot), mode);
      const shown = mode === ThemeMode.Dark ? ".nol-site-section-shot-dark" : ".nol-site-section-shot-light";
      const hidden = mode === ThemeMode.Dark ? ".nol-site-section-shot-light" : ".nol-site-section-shot-dark";
      const frame = getComputedStyle(part(shown));

      expect([frame.display, getComputedStyle(part(hidden)).display, frame.borderTopStyle, frame.borderTopWidth, frame.borderTopColor, frame.borderTopLeftRadius,
        frame.backgroundColor]).toEqual(["block", "none", "solid", "1px", color(mode, "border"), `${String(rem(0.75))}px`, color(mode, "panel")]);
    });

    for (const size of [new SectionWidth(1280, 2.5, 6.875, 2.625), new SectionWidth(375, 1.25, 4.375, 1.8125)]) {
      it(`draws the shot at the shell's full width, under the content, keeping its ratio, at ${String(size.width)} pixels, ${mode}`, async () => {
        await page.viewport(size.width, 800);
        await renderAsync(t => t.shot.set(productShot), mode);
        const outer = section().getBoundingClientRect();
        const block = box("section");
        const shot = box(mode === ThemeMode.Dark ? ".nol-site-section-shot-dark" : ".nol-site-section-shot-light");

        AppearanceFixture.expectPixels(block.width, Math.min(rem(75), outer.width - 2 * rem(size.gutter)));
        AppearanceFixture.expectPixels(shot.left, block.left);
        AppearanceFixture.expectPixels(shot.width, block.width);
        AppearanceFixture.expectPixels(shot.top - part(".body").getBoundingClientRect().bottom, rem(size.contentGap));
        AppearanceFixture.expectPixels(shot.height, (shot.width - 2) * 1022 / 1438 + 2);
        AppearanceFixture.expectPixels(block.bottom - shot.bottom, rem(size.space));
      });

      it(`draws the shot in the content's place when the section has none, at ${String(size.width)} pixels, ${mode}`, async () => {
        await page.viewport(size.width, 800);
        AppearanceFixture.apply(DefaultTheme.theme, mode);
        document.documentElement.setAttribute("data-nol-theme-mode", mode);
        const shotOnly = TestBed.createComponent(SiteSectionShotHostComponent);
        shotOnly.detectChanges();
        await shotOnly.whenStable();
        const root = DomFixture.one(DomFixture.host(shotOnly), "nol-site-section");
        const shot = DomFixture.one(root, mode === ThemeMode.Dark ? ".nol-site-section-shot-dark" : ".nol-site-section-shot-light").getBoundingClientRect();

        AppearanceFixture.expectPixels(shot.top - DomFixture.one(root, ".nol-site-section-heading").getBoundingClientRect().bottom, rem(size.contentGap));
        AppearanceFixture.expectPixels(DomFixture.one(root, "section").getBoundingClientRect().bottom - shot.bottom, rem(size.space));
        shotOnly.destroy();
      });
    }
  }
});
