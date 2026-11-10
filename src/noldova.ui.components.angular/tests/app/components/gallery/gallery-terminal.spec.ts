/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { GalleryContentComponent } from "../../../../src/app/components/gallery/gallery-content.component";
import { GalleryResources } from "../../../../src/app/components/gallery/gallery-resources";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

describe("GalleryContentComponent's terminal colors", () => {
  let fixture: ComponentFixture<GalleryContentComponent>;

  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("shows the terminal's 16 ANSI colors on the window and panel colors, its text, cursor and selection in the colors the theme gives them, in each mode", async () => {
    const seen: string[][] = [];

    for (const mode of AppearanceFixture.modes) {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      fixture = TestBed.createComponent(GalleryContentComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      const section = DomFixture.one(DomFixture.host(fixture), ".nol-gallery-specimen[aria-label=\"Terminal colors\"]");
      const color = (name: string): string => AppearanceFixture.readColor(DefaultTheme.theme, mode, name);
      const [onWindow, onPanel, text] = [...section.querySelectorAll<HTMLElement>(".nol-gallery-terminal")];
      const shown = (surface: HTMLElement | undefined, name: string): string[] => {
        const swatches = [...(surface?.querySelectorAll<HTMLElement>(".nol-gallery-terminal-color") ?? [])];
        const background = getComputedStyle(surface ?? section).backgroundColor;
        return [
          String(background === color(name)),
          ...swatches.map(t => `${t.textContent} ${getComputedStyle(DomFixture.one(t, ".nol-gallery-terminal-swatch")).backgroundColor === color(`terminal-ansi-${t.textContent}`)}`),
          String(swatches.every(t => getComputedStyle(t).color === color("terminal-foreground") && AppearanceFixture.contrast(getComputedStyle(t).color, background) >= 4.5)),
          swatches.filter(t => AppearanceFixture.contrast(color(`terminal-ansi-${t.textContent}`), background) < 4.5).map(t => t.textContent).join(" ")
        ];
      };
      seen.push([
        ...shown(onWindow, "window"),
        ...shown(onPanel, "panel"),
        String(getComputedStyle(text ?? section).backgroundColor === color("terminal-background") && getComputedStyle(text ?? section).color === color("terminal-foreground")),
        String(getComputedStyle(DomFixture.one(section, ".nol-gallery-terminal-cursor")).backgroundColor === color("terminal-cursor")),
        String(getComputedStyle(DomFixture.one(section, ".nol-gallery-terminal-selection")).backgroundColor === color("terminal-selection"))
      ]);
      fixture.destroy();
    }

    const under: readonly string[] = [
      "yellow cyan bright-red bright-green bright-yellow bright-blue bright-magenta bright-cyan bright-white",
      "black red blue magenta bright-black"
    ];
    const names = GalleryResources.terminalColors.map(t => `${t} true`);
    expect(seen).toEqual(AppearanceFixture.modes.map((_, i) => [
      "true", ...names, "true", under[i], "true", ...names, "true", under[i], "true", "true", "true"
    ]));
    expect(names).toHaveLength(16);
  });
});
