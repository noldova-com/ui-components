/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { GalleryDialogComponent } from "../../../../src/app/components/gallery/gallery-dialog.component";
import { GalleryMenuComponent } from "../../../../src/app/components/gallery/gallery-menu.component";
import { GalleryOverlaysComponent } from "../../../../src/app/components/gallery/gallery-overlays.component";
import { GalleryPopoverComponent } from "../../../../src/app/components/gallery/gallery-popover.component";
import { GalleryQuickInputComponent } from "../../../../src/app/components/gallery/gallery-quick-input.component";
import { GalleryState } from "../../../../src/app/enums/gallery-state";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Focus cells of the overlays section", () => {
  const specimens = [GalleryDialogComponent, GalleryMenuComponent, GalleryPopoverComponent, GalleryQuickInputComponent];

  it.each(GalleryStateFixture.specimens(specimens))("shows in each of the Focus cells of $name the look its control has when it really holds the keyboard focus", async ({ specimen }) => {
    await GalleryStateFixture.expectFocusCellsShowTheirLookAsync(specimen);
  });

  it("finds a Focus cell in every specimen of the section but one marked noFocus, and only in the specimens above", async () => {
    await GalleryStateFixture.expectSectionCellsAsync(GalleryOverlaysComponent, GalleryState.Focus, specimens);
  });
});
