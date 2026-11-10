/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { CardComponent } from "../card/card.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-card",
  imports: [CardComponent, GalleryCellComponent, GallerySpecimenComponent],
  templateUrl: "./gallery-card.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryCardComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
}
