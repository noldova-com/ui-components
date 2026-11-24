/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryFeedComponent } from "../../../../src/app/components/gallery/gallery-feed.component";
import { GalleryGroupHeaderComponent } from "../../../../src/app/components/gallery/gallery-group-header.component";
import { GalleryNavigationComponent } from "../../../../src/app/components/gallery/gallery-navigation.component";
import { GallerySectionHeaderComponent } from "../../../../src/app/components/gallery/gallery-section-header.component";
import { GallerySiteFooterComponent } from "../../../../src/app/components/gallery/gallery-site-footer.component";
import { GallerySiteHeaderComponent } from "../../../../src/app/components/gallery/gallery-site-header.component";
import { GalleryTabComponent } from "../../../../src/app/components/gallery/gallery-tab.component";
import { GalleryToolbarButtonComponent } from "../../../../src/app/components/gallery/gallery-toolbar-button.component";
import { GalleryState } from "../../../../src/app/enums/gallery-state";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Hover cells of the navigation section", () => {
  const specimens = [GalleryFeedComponent, GalleryGroupHeaderComponent, GallerySectionHeaderComponent, GallerySiteFooterComponent, GallerySiteHeaderComponent, GalleryTabComponent, GalleryToolbarButtonComponent];

  it.each(GalleryStateFixture.specimens(specimens))("shows in each of the Hover cells of $name the look its control has when the pointer is really over it", async ({ specimen }) => {
    await GalleryStateFixture.expectHoverCellsShowTheirLookAsync(specimen);
  });

  it("finds a Hover cell in every specimen of the section but one marked noHover, and only in the specimens above", async () => {
    await GalleryStateFixture.expectSectionCellsAsync(GalleryNavigationComponent, GalleryState.Hover, specimens);
  });
});
