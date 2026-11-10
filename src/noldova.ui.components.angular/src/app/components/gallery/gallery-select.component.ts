/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { SelectGroup } from "../../models/select-group.js";
import { SelectOption } from "../../models/select-option.js";
import { SelectComponent } from "../select/select.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-select",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, SelectComponent],
  templateUrl: "./gallery-select.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GallerySelectComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly focusedSelect: string = GalleryResources.focusedSelect;
  protected readonly options: readonly SelectOption[] = GalleryResources.text.selectOptions.map(t => new SelectOption(t.value, t.title, t.tag));
  protected readonly groupOptions: readonly SelectGroup[] = GalleryResources.text.selectGroups.map(t => new SelectGroup(t.label, t.options.map(option => new SelectOption(option.value, option.title, option.tag, option.isDisabled))));
  protected readonly choice: WritableSignal<string> = signal(GalleryResources.text.selectInitial);
}
