/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-terminal-colors",
  imports: [GalleryCellComponent, GallerySpecimenComponent],
  templateUrl: "./gallery-terminal-colors.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryTerminalColorsComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly terminalColors: readonly string[] = GalleryResources.terminalColors;
  protected readonly terminalSurfaces: readonly (readonly [string, string])[] = [["window", this.text.terminalWindowCaption], ["panel", this.text.terminalPanelCaption]];
}
