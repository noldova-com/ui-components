/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { FileBadgeComponent } from "../file-badge/file-badge.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-file-badge",
  imports: [FileBadgeComponent, GalleryCellComponent, GallerySpecimenComponent],
  templateUrl: "./gallery-file-badge.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryFileBadgeComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
}
