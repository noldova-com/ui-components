/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { ChoiceRowType } from "../../enums/choice-row-type.js";
import { ChoiceRowComponent } from "../choice-row/choice-row.component.js";
import { RadioGroupComponent } from "../radio/radio-group.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-choice-row",
  imports: [ChoiceRowComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, RadioGroupComponent],
  templateUrl: "./gallery-choice-row.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GalleryChoiceRowComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly focusedRadio: string = GalleryResources.focusedRadio;
  protected readonly choiceTypes: typeof ChoiceRowType = ChoiceRowType;
  protected readonly branch: WritableSignal<string | null> = signal(GalleryResources.text.choiceRowOptions[0].value);
  protected readonly checks: WritableSignal<readonly string[]> = signal([GalleryResources.text.choiceRowCheckOptions[0].label]);

  protected toggleCheck(label: string, isChecked: boolean): void {
    this.checks.update(t => isChecked ? [...t, label] : t.filter(u => u !== label));
  }
}
