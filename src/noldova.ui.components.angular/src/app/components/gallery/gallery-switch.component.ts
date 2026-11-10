/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { SwitchComponent } from "../switch/switch.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-switch",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, SwitchComponent],
  templateUrl: "./gallery-switch.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GallerySwitchComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly focusedSwitch: string = GalleryResources.focusedSwitch;
  protected readonly isSwitchOn: WritableSignal<boolean> = signal(true);
}
