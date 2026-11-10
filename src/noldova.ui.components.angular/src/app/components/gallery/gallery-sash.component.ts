/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { SashOrientation } from "../../enums/sash-orientation.js";
import { SashComponent } from "../sash/sash.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-sash",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, SashComponent],
  templateUrl: "./gallery-sash.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GallerySashComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly orientations: typeof SashOrientation = SashOrientation;
}
