/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { ButtonSize } from "../../enums/button-size.js";
import { ButtonVariant } from "../../enums/button-variant.js";
import { ButtonComponent } from "../button/button.component.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-button",
  imports: [ButtonComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, IconButtonComponent, TooltipDirective],
  templateUrl: "./gallery-button.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryButtonComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly buttonSizes: typeof ButtonSize = ButtonSize;
}
