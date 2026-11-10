/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { ViewBadgeComponent } from "../view-badge/view-badge.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-view-badge",
  imports: [GalleryCellComponent, GallerySpecimenComponent, ViewBadgeComponent],
  templateUrl: "./gallery-view-badge.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GalleryViewBadgeComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
}
