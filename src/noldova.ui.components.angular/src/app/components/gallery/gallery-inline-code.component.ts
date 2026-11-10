/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { InlineCodeComponent } from "../inline-code/inline-code.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-inline-code",
  imports: [GalleryCellComponent, GallerySpecimenComponent, InlineCodeComponent],
  templateUrl: "./gallery-inline-code.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryInlineCodeComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
}
