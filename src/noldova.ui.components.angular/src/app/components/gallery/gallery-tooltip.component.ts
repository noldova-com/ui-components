/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { ButtonVariant } from "../../enums/button-variant.js";
import { OverlaySide } from "../../models/overlay-side.js";
import { ButtonComponent } from "../button/button.component.js";
import { TooltipComponent } from "../tooltip/tooltip.component.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-tooltip",
  imports: [ButtonComponent, GalleryCellComponent, GallerySpecimenComponent, TooltipComponent, TooltipDirective],
  templateUrl: "./gallery-tooltip.component.html",
  styleUrl: "./gallery-overlays.component.css"
})
export class GalleryTooltipComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly below: OverlaySide = OverlaySide.below;
}
