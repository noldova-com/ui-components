/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { ToolbarButtonSize } from "../../enums/toolbar-button-size.js";
import { ToolbarButtonComponent } from "../toolbar-button/toolbar-button.component.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-toolbar-button",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, ToolbarButtonComponent, TooltipDirective],
  templateUrl: "./gallery-toolbar-button.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GalleryToolbarButtonComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof ToolbarButtonSize = ToolbarButtonSize;
}
