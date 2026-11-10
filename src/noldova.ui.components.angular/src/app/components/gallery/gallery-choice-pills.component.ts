/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { SelectOption } from "../../models/select-option.js";
import { ChoicePillsComponent } from "../choice-pills/choice-pills.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-choice-pills",
  imports: [ChoicePillsComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective],
  templateUrl: "./gallery-choice-pills.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryChoicePillsComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly hoveredPill: string = GalleryResources.hoveredPill;
  protected readonly focusedPill: string = GalleryResources.focusedPill;
  protected readonly pillOptions: readonly SelectOption[] = GalleryResources.text.choicePillOptions.map(t => new SelectOption(t.value, t.title));
  protected readonly longPillOptions: readonly SelectOption[] = GalleryResources.text.choicePillOptionsLong.map(t => new SelectOption(t.value, t.title));
  protected readonly pill: WritableSignal<string> = signal(GalleryResources.text.choicePillInitial);
}
