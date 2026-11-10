/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { TerminalOutputComponent } from "../terminal-output/terminal-output.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryTerminalOutputs } from "./gallery-terminal-outputs.js";

@Component({
  selector: "nol-gallery-terminal-output",
  imports: [GalleryCellComponent, GallerySpecimenComponent, TerminalOutputComponent],
  templateUrl: "./gallery-terminal-output.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryTerminalOutputComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly terminalOutputs: typeof GalleryTerminalOutputs = GalleryTerminalOutputs;
}
