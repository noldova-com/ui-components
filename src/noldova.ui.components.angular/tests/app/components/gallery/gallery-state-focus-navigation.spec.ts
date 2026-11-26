/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryCanvasComponent } from "../../../../src/app/components/gallery/gallery-canvas.component";
import { GalleryFeedComponent } from "../../../../src/app/components/gallery/gallery-feed.component";
import { GalleryGroupHeaderComponent } from "../../../../src/app/components/gallery/gallery-group-header.component";
import { GalleryNavigationComponent } from "../../../../src/app/components/gallery/gallery-navigation.component";
import { GallerySashComponent } from "../../../../src/app/components/gallery/gallery-sash.component";
import { GallerySectionHeaderComponent } from "../../../../src/app/components/gallery/gallery-section-header.component";
import { GallerySiteFooterComponent } from "../../../../src/app/components/gallery/gallery-site-footer.component";
import { GallerySiteHeaderComponent } from "../../../../src/app/components/gallery/gallery-site-header.component";
import { GallerySitePartsComponent } from "../../../../src/app/components/gallery/gallery-site-parts.component";
import { GalleryTabComponent } from "../../../../src/app/components/gallery/gallery-tab.component";
import { GalleryToolbarButtonComponent } from "../../../../src/app/components/gallery/gallery-toolbar-button.component";
import { GalleryToolbarComponent } from "../../../../src/app/components/gallery/gallery-toolbar.component";
import { GalleryTreeComponent } from "../../../../src/app/components/gallery/gallery-tree.component";
import { GalleryVirtualListComponent } from "../../../../src/app/components/gallery/gallery-virtual-list.component";
import { GalleryState } from "../../../../src/app/enums/gallery-state";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Focus cells of the navigation section", () => {
  const specimens = [GalleryCanvasComponent, GalleryFeedComponent, GalleryGroupHeaderComponent, GallerySashComponent, GallerySectionHeaderComponent, GallerySiteFooterComponent, GallerySiteHeaderComponent, GallerySitePartsComponent, GalleryTabComponent, GalleryToolbarComponent, GalleryToolbarButtonComponent, GalleryTreeComponent, GalleryVirtualListComponent];

  it.each(GalleryStateFixture.specimens(specimens))("shows in each of the Focus cells of $name the look its control has when it really holds the keyboard focus", async ({ specimen }) => {
    await GalleryStateFixture.expectFocusCellsShowTheirLookAsync(specimen);
  });

  it("finds a Focus cell in every specimen of the section but one marked noFocus, and only in the specimens above", async () => {
    await GalleryStateFixture.expectSectionCellsAsync(GalleryNavigationComponent, GalleryState.Focus, specimens);
  });
});
