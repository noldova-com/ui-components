/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { GalleryContentComponent } from "../../../../src/app/components/gallery/gallery-content.component";
import { GalleryFormsComponent } from "../../../../src/app/components/gallery/gallery-forms.component";
import { GalleryNavigationComponent } from "../../../../src/app/components/gallery/gallery-navigation.component";
import { GalleryOverlaysComponent } from "../../../../src/app/components/gallery/gallery-overlays.component";
import { GalleryTokens } from "../../../../src/app/components/gallery/gallery-tokens";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";

describe("GalleryTokens", () => {
  it("gives the Gallery the kit's four sections, in the order every scope shows them", () => {
    expect(TestBed.inject(GalleryTokens.kitSections)).toEqual([GalleryFormsComponent, GalleryNavigationComponent, GalleryOverlaysComponent, GalleryContentComponent]);
  });

  it("gives the Gallery the sections the specs read one at a time, so a section added to the Gallery is one they read", () => {
    expect(TestBed.inject(GalleryTokens.kitSections)).toEqual(GalleryFixture.kitSections);
  });
});
