/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GalleryButtonComponent } from "./gallery-button.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryCheckboxComponent } from "./gallery-checkbox.component.js";
import { GalleryChipComponent } from "./gallery-chip.component.js";
import { GalleryChoicePillsComponent } from "./gallery-choice-pills.component.js";
import { GalleryChoiceRowComponent } from "./gallery-choice-row.component.js";
import { GalleryConfigurationTableComponent } from "./gallery-configuration-table.component.js";
import { GalleryIconButtonComponent } from "./gallery-icon-button.component.js";
import { GalleryMeterComponent } from "./gallery-meter.component.js";
import { GalleryProgressComponent } from "./gallery-progress.component.js";
import { GalleryRadioComponent } from "./gallery-radio.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySelectComponent } from "./gallery-select.component.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GallerySpinnerComponent } from "./gallery-spinner.component.js";
import { GallerySplitButtonComponent } from "./gallery-split-button.component.js";
import { GallerySwitchComponent } from "./gallery-switch.component.js";
import { GalleryTextFieldComponent } from "./gallery-text-field.component.js";

@Component({
  selector: "nol-gallery-forms",
  imports: [GalleryButtonComponent, GalleryCellComponent, GalleryCheckboxComponent, GalleryChipComponent, GalleryChoicePillsComponent, GalleryChoiceRowComponent, GalleryConfigurationTableComponent,
    GalleryIconButtonComponent, GalleryMeterComponent, GalleryProgressComponent, GalleryRadioComponent, GallerySelectComponent, GallerySpecimenComponent, GallerySpinnerComponent, GallerySplitButtonComponent,
    GallerySwitchComponent, GalleryTextFieldComponent],
  templateUrl: "./gallery-forms.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryFormsComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
}
