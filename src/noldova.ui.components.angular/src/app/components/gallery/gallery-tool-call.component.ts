/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { CodeBlockComponent } from "../code-block/code-block.component.js";
import { ToolCallOutputDirective } from "../tool-call/tool-call-output.directive.js";
import { ToolCallComponent } from "../tool-call/tool-call.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";
import { GalleryToolCalls } from "./gallery-tool-calls.js";

@Component({
  selector: "nol-gallery-tool-call",
  imports: [CodeBlockComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, ToolCallComponent, ToolCallOutputDirective],
  templateUrl: "./gallery-tool-call.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryToolCallComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly calls: GalleryToolCalls = new GalleryToolCalls(new Date());
  protected readonly toggle: string = GalleryResources.toolCallToggle;
}
