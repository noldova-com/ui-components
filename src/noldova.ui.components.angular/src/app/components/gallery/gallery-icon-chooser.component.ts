/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { IconChooserComponent } from "../icon-chooser/icon-chooser.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-icon-chooser",
  imports: [IconChooserComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective],
  templateUrl: "./gallery-icon-chooser.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryIconChooserComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly focusedIconChooser: string = GalleryResources.focusedIconChooser;
  protected readonly icon: WritableSignal<string | null> = signal(GalleryResources.text.iconChooserInitial);
}
