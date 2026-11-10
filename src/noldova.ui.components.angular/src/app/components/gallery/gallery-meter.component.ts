/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { MeterComponent } from "../meter/meter.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-meter",
  imports: [GalleryCellComponent, GallerySpecimenComponent, MeterComponent],
  templateUrl: "./gallery-meter.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryMeterComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
}
