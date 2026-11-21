/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { ButtonVariant } from "../../enums/button-variant.js";
import { GallerySize } from "../../enums/gallery-size.js";
import { PopoverOpening } from "../../enums/popover-opening.js";
import { ButtonComponent } from "../button/button.component.js";
import { PopoverDirective } from "../popover/popover.directive.js";
import { PopoverTriggerDirective } from "../popover/popover-trigger.directive.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-popover",
  imports: [ButtonComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, PopoverDirective, PopoverTriggerDirective],
  templateUrl: "./gallery-popover.component.html",
  styleUrl: "./gallery-overlays.component.css"
})
export class GalleryPopoverComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly openings: typeof PopoverOpening = PopoverOpening;
}
