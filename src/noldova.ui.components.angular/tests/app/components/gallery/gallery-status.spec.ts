/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { GalleryContentComponent } from "../../../../src/app/components/gallery/gallery-content.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import type { Theme } from "../../../../src/app/models/theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

describe("GalleryContentComponent's status colors", () => {
  let fixture: ComponentFixture<GalleryContentComponent>;

  async function showAsync(theme: Theme): Promise<HTMLElement> {
    AppearanceFixture.apply(theme, ThemeMode.Light);
    fixture = TestBed.createComponent(GalleryContentComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    return DomFixture.one(DomFixture.host(fixture), ".nol-gallery-specimen[aria-label=\"Status colors\"]");
  }

  const dots = (section: HTMLElement): HTMLElement[] => [...section.querySelectorAll<HTMLElement>(".nol-gallery-status-dot")];

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  for (const theme of AppearanceFixture.themes)
    it(`shows a positive and a failed dot, round and half a rem wide on their label's line, in the ${theme.id} theme's status colors in each mode on the window and the panel color, and in CanvasText under forced colors`, async () => {
      const section = await showAsync(theme);
      const surfaces = [...section.querySelectorAll<HTMLElement>(".nol-gallery-status")];
      const shown = AppearanceFixture.modes.map(mode => {
        AppearanceFixture.apply(theme, mode);
        return [...surfaces, ...dots(section)].map(t => getComputedStyle(t).backgroundColor);
      });
      const expected = AppearanceFixture.modes.map(mode => ["window", "panel", "status-ok", "status-failed", "status-ok", "status-failed"].map(t => AppearanceFixture.readColor(theme, mode, t)));

      expect(shown).toEqual(expected);
      expect(surfaces.map(t => [...t.querySelectorAll(".nol-gallery-status-row")].map(u => u.textContent?.trim()))).toEqual(Array(2).fill(["Connected", "Connection error"]));
      for (const dot of dots(section)) {
        const box = dot.getBoundingClientRect();
        const label = (dot.parentElement as HTMLElement).getBoundingClientRect();

        AppearanceFixture.expectRem(`${box.width}px`, 0.5);
        AppearanceFixture.expectRem(`${box.height}px`, 0.5);
        expect(getComputedStyle(dot).borderTopLeftRadius).toBe("50%");
        AppearanceFixture.expectPixels((box.top + box.bottom) / 2, (label.top + label.bottom) / 2);
      }
      await ForcedColorsFixture.activateAsync();
      try {
        expect(dots(section).map(t => getComputedStyle(t).backgroundColor)).toEqual(Array(4).fill(ForcedColorsFixture.resolve("CanvasText")));
      }
      finally {
        await ForcedColorsFixture.resetAsync();
      }
    });
});
