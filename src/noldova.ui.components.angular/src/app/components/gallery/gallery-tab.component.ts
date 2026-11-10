/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { TabTone } from "../../enums/tab-tone.js";
import { TabMarker } from "../../models/tab-marker.js";
import { TabStatus } from "../../models/tab-status.js";
import { TabComponent } from "../tab/tab.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-tab",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, TabComponent],
  templateUrl: "./gallery-tab.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GalleryTabComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly tabImage: string = GalleryResources.tabImage;
  protected readonly tabFailed: TabStatus = new TabStatus(this.text.glyphError, this.text.tabUnreachable, TabTone.Failed);
  protected readonly tabBlocked: TabStatus = new TabStatus(this.text.glyphBlock, this.text.tabBlocked);
  protected readonly tabMarker: TabMarker = new TabMarker(this.text.glyphOpenedFrom, this.text.tabOpenedFrom);
}
