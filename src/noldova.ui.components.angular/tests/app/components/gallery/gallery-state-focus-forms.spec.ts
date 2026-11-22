/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryButtonComponent } from "../../../../src/app/components/gallery/gallery-button.component";
import { GalleryCheckboxComponent } from "../../../../src/app/components/gallery/gallery-checkbox.component";
import { GalleryChoicePillsComponent } from "../../../../src/app/components/gallery/gallery-choice-pills.component";
import { GalleryChoiceRowComponent } from "../../../../src/app/components/gallery/gallery-choice-row.component";
import { GalleryColorChooserComponent } from "../../../../src/app/components/gallery/gallery-color-chooser.component";
import { GalleryFormsComponent } from "../../../../src/app/components/gallery/gallery-forms.component";
import { GalleryIconButtonComponent } from "../../../../src/app/components/gallery/gallery-icon-button.component";
import { GalleryRadioComponent } from "../../../../src/app/components/gallery/gallery-radio.component";
import { GallerySelectComponent } from "../../../../src/app/components/gallery/gallery-select.component";
import { GallerySplitButtonComponent } from "../../../../src/app/components/gallery/gallery-split-button.component";
import { GallerySwitchComponent } from "../../../../src/app/components/gallery/gallery-switch.component";
import { GalleryTextFieldComponent } from "../../../../src/app/components/gallery/gallery-text-field.component";
import { GalleryState } from "../../../../src/app/enums/gallery-state";
import { GalleryStateFixture } from "../../../fixtures/gallery-state.fixture";

describe("GalleryStateDirective Focus cells of the forms section", () => {
  const specimens = [GalleryButtonComponent, GalleryCheckboxComponent, GalleryChoicePillsComponent, GalleryChoiceRowComponent, GalleryColorChooserComponent, GalleryIconButtonComponent, GalleryRadioComponent, GallerySelectComponent, GallerySplitButtonComponent, GallerySwitchComponent, GalleryTextFieldComponent];

  it.each(GalleryStateFixture.specimens(specimens))("shows in each of the Focus cells of $name the look its control has when it really holds the keyboard focus", async ({ specimen }) => {
    await GalleryStateFixture.expectFocusCellsShowTheirLookAsync(specimen);
  });

  it("finds a Focus cell in every specimen of the section but one marked noFocus, and only in the specimens above", async () => {
    await GalleryStateFixture.expectSectionCellsAsync(GalleryFormsComponent, GalleryState.Focus, specimens);
  });
});
