/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { CanvasItemDirective } from "../canvas/canvas-item.directive.js";
import { CanvasComponent } from "../canvas/canvas.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-canvas",
  imports: [CanvasComponent, CanvasItemDirective, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective],
  templateUrl: "./gallery-canvas.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GalleryCanvasComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly teams: readonly string[] = GalleryResources.canvasTeams;
}
