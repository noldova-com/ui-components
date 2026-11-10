/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { PanelSurface } from "../../enums/panel-surface.js";
import { PanelCardComponent } from "../panel-card/panel-card.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-panel-card",
  imports: [GalleryCellComponent, GallerySpecimenComponent, PanelCardComponent],
  templateUrl: "./gallery-panel-card.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GalleryPanelCardComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly surfaces: typeof PanelSurface = PanelSurface;
}
