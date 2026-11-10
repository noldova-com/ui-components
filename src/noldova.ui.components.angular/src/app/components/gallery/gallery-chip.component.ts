/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { ChipKind } from "../../enums/chip-kind.js";
import { ChipComponent } from "../chip/chip.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-chip",
  imports: [ChipComponent, GalleryCellComponent, GallerySpecimenComponent],
  templateUrl: "./gallery-chip.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryChipComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly chipKinds: typeof ChipKind = ChipKind;
}
