/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { PermissionCardComponent } from "../permission-card/permission-card.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryPermissionCards } from "./gallery-permission-cards.js";
import { GalleryPressDirective } from "./gallery-press.directive.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-permission-card",
  imports: [GalleryCellComponent, GalleryPressDirective, GallerySpecimenComponent, GalleryStateDirective, PermissionCardComponent],
  templateUrl: "./gallery-permission-card.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryPermissionCardComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly permissions: GalleryPermissionCards = new GalleryPermissionCards(new Date());
  protected readonly option: string = GalleryResources.permissionOption;
  protected readonly alwaysAllow: string = GalleryResources.permissionAlwaysAllow;
}
