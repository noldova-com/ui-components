/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { CheckboxComponent } from "../checkbox/checkbox.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-checkbox",
  imports: [CheckboxComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective],
  templateUrl: "./gallery-checkbox.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryCheckboxComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly focusedCheckbox: string = GalleryResources.focusedCheckbox;
  protected readonly isChecked: WritableSignal<boolean> = signal(true);
}
