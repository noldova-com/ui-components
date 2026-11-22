/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { ColorChooserComponent } from "../color-chooser/color-chooser.component.js";
import { ColorPickerComponent } from "../color-picker/color-picker.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-color-chooser",
  imports: [ColorChooserComponent, ColorPickerComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective],
  templateUrl: "./gallery-color-chooser.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryColorChooserComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly hoveredSwatch: string = GalleryResources.hoveredSwatch;
  protected readonly focusedSwatch: string = GalleryResources.focusedSwatch;
  protected readonly color: WritableSignal<string | null> = signal(GalleryResources.text.colorChooserInitial);
  protected readonly lowContrast: WritableSignal<string | null> = signal(GalleryResources.text.colorChooserLowContrast);
  protected readonly custom: WritableSignal<string> = signal(GalleryResources.text.colorPickerInitial);
}
