/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-icon-button",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, IconButtonComponent],
  templateUrl: "./gallery-icon-button.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryIconButtonComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly isPressed: WritableSignal<boolean> = signal(true);
}
