/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { GalleryButtonComponent } from "../../../../src/app/components/gallery/gallery-button.component";
import { GalleryChoicePillsComponent } from "../../../../src/app/components/gallery/gallery-choice-pills.component";
import { GalleryChoiceRowComponent } from "../../../../src/app/components/gallery/gallery-choice-row.component";
import { GalleryConfigurationTableComponent } from "../../../../src/app/components/gallery/gallery-configuration-table.component";
import { GalleryFormsComponent } from "../../../../src/app/components/gallery/gallery-forms.component";
import { GalleryIconButtonComponent } from "../../../../src/app/components/gallery/gallery-icon-button.component";
import { GallerySplitButtonComponent } from "../../../../src/app/components/gallery/gallery-split-button.component";
import { GalleryState } from "../../../../src/app/enums/gallery-state";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Hover cells of the forms section", () => {
  const specimens = [GalleryButtonComponent, GalleryChoicePillsComponent, GalleryChoiceRowComponent, GalleryConfigurationTableComponent, GalleryIconButtonComponent, GallerySplitButtonComponent];

  it.each(GalleryStateFixture.specimens(specimens))("shows in each of the Hover cells of $name the look its control has when the pointer is really over it", async ({ specimen }) => {
    await GalleryStateFixture.expectHoverCellsShowTheirLookAsync(specimen);
  });

  it("finds a Hover cell in every specimen of the section but one marked noHover, and only in the specimens above", async () => {
    await GalleryStateFixture.expectSectionCellsAsync(GalleryFormsComponent, GalleryState.Hover, specimens);
  });
});
