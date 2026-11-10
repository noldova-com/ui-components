/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { SpinnerComponent } from "../spinner/spinner.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-spinner",
  imports: [GalleryCellComponent, GallerySpecimenComponent, SpinnerComponent],
  templateUrl: "./gallery-spinner.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GallerySpinnerComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
}
