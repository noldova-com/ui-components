/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { MenuItemComponent } from "../menu/menu-item.component.js";
import { MenuComponent } from "../menu/menu.component.js";
import { SplitButtonComponent } from "../split-button/split-button.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-split-button",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, MenuComponent, MenuItemComponent, SplitButtonComponent],
  templateUrl: "./gallery-split-button.component.html",
  styleUrl: "./gallery-forms.component.css"
})
export class GallerySplitButtonComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
}
