/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { QueryMatcher } from "../../models/query-matcher.js";
import { QuickInputItem } from "../../models/quick-input-item.js";
import { QuickInputComponent } from "../quick-input/quick-input.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-quick-input",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, QuickInputComponent],
  templateUrl: "./gallery-quick-input.component.html",
  styleUrl: "./gallery-overlays.component.css"
})
export class GalleryQuickInputComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly items: readonly QuickInputItem[] = [
    new QuickInputItem("one", GalleryResources.text.quickInputOne, GalleryResources.text.glyphAdd, GalleryResources.text.quickInputDetail, GalleryResources.text.quickInputKey,
      QueryMatcher.find(GalleryResources.text.quickInputQuery, GalleryResources.text.quickInputOne)),
    new QuickInputItem("two", GalleryResources.text.quickInputTwo, null, null, null, QueryMatcher.find(GalleryResources.text.quickInputQuery, GalleryResources.text.quickInputTwo)),
    new QuickInputItem("three", GalleryResources.text.quickInputLong, GalleryResources.text.glyphSave, GalleryResources.text.quickInputDetail, null,
      QueryMatcher.find(GalleryResources.text.quickInputQuery, GalleryResources.text.quickInputLong))
  ];
  protected readonly longItems: readonly QuickInputItem[] = this.items.slice(-1);
  protected readonly noItems: readonly QuickInputItem[] = [];
}
