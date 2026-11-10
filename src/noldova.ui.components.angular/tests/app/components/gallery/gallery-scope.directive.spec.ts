/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GalleryScopeDirective } from "../../../../src/app/components/gallery/gallery-scope.directive";
import type { IGalleryScope } from "../../../../src/app/interfaces/i-gallery-scope";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";

@Component({
  imports: [GalleryScopeDirective],
  template: `
    @for (scope of scopes; track $index) {
      <section [nolGalleryScope]="scope.theme" [nolGalleryMode]="scope.mode"></section>
    }
  `
})
class ScopesHostComponent {
  protected readonly scopes: readonly Pick<IGalleryScope, "theme" | "mode">[] = AppearanceFixture.themes.flatMap(theme => AppearanceFixture.modes.map(mode => ({ theme, mode })));
}

describe("GalleryScopeDirective", () => {
  afterEach(() => {
    AppearanceFixture.reset();
  });

  it("paints each scope with its own theme and mode, and derives colors from them within the scope", async () => {
    const fixture = await GalleryFixture.showSectionAsync(ScopesHostComponent);
    const sections = DomFixture.all(DomFixture.host(fixture), "section");
    const defaultLight = DomFixture.at(sections, 0);
    const defaultDark = DomFixture.at(sections, 1);
    const fixtureLight = DomFixture.at(sections, 2);
    const fixtureDark = DomFixture.at(sections, 3);

    expect(GalleryFixture.colorOf(defaultLight, "color", "var(--nol-text)")).toBe(GalleryFixture.colorOf(defaultLight, "color", "#3B3B3B"));
    expect(GalleryFixture.colorOf(defaultDark, "color", "var(--nol-text)")).toBe(GalleryFixture.colorOf(defaultDark, "color", "#BDBDBD"));
    expect(GalleryFixture.colorOf(fixtureLight, "color", "var(--nol-text)")).toBe(GalleryFixture.colorOf(fixtureLight, "color", "#A00610"));
    expect(GalleryFixture.colorOf(fixtureDark, "color", "var(--nol-text)")).toBe(GalleryFixture.colorOf(fixtureDark, "color", "#2006A0"));
    expect(GalleryFixture.colorOf(fixtureLight, "background-color", "var(--nol-inline-code)")).toBe(GalleryFixture.colorOf(fixtureLight, "background-color", "color-mix(in srgb, #A00610 12%, transparent)"));
    expect(GalleryFixture.colorOf(fixtureDark, "background-color", "var(--nol-inline-code)")).toBe(GalleryFixture.colorOf(fixtureDark, "background-color", "color-mix(in srgb, #2006A0 12%, transparent)"));
    expect(GalleryFixture.colorOf(document.body, "background-color", "var(--nol-inline-code)")).not.toBe(GalleryFixture.colorOf(fixtureLight, "background-color", "var(--nol-inline-code)"));
  });
});
