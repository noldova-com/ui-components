/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { RadioComponent } from "../radio/radio.component.js";
import { RadioGroupComponent } from "../radio/radio-group.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-radio",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, RadioComponent, RadioGroupComponent],
  templateUrl: "./gallery-radio.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryRadioComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly focusedRadio: string = GalleryResources.focusedRadio;
  protected readonly radio: WritableSignal<string | null> = signal(GalleryResources.text.picked);
}
