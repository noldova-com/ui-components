/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-status-colors",
  imports: [GalleryCellComponent, GallerySpecimenComponent],
  templateUrl: "./gallery-status-colors.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryStatusColorsComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly statusSurfaces: readonly (readonly [string, string])[] = [["window", this.text.statusWindowCaption], ["panel", this.text.statusPanelCaption]];
}
