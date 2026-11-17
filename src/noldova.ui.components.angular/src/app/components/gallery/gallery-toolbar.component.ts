/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { ToolbarButtonComponent } from "../toolbar-button/toolbar-button.component.js";
import { ToolbarItemDirective } from "../toolbar/toolbar-item.directive.js";
import { ToolbarDirective } from "../toolbar/toolbar.directive.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-toolbar",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, IconButtonComponent, ToolbarButtonComponent, ToolbarDirective, ToolbarItemDirective, TooltipDirective],
  templateUrl: "./gallery-toolbar.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GalleryToolbarComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
}
