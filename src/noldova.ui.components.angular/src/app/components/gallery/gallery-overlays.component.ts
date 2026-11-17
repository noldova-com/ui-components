/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { DockingDirection } from "../../enums/docking-direction.js";
import { DockingGuideComponent } from "../docking-guide/docking-guide.component.js";
import { DockingPlateComponent } from "../docking-plate/docking-plate.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryCompletionListComponent } from "./gallery-completion-list.component.js";
import { GalleryDialogComponent } from "./gallery-dialog.component.js";
import { GalleryMentionFieldComponent } from "./gallery-mention-field.component.js";
import { GalleryMenuComponent } from "./gallery-menu.component.js";
import { GalleryPopoverComponent } from "./gallery-popover.component.js";
import { GalleryQuickInputComponent } from "./gallery-quick-input.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryTooltipComponent } from "./gallery-tooltip.component.js";

@Component({
  selector: "nol-gallery-overlays",
  imports: [
    DockingGuideComponent, DockingPlateComponent, GalleryCellComponent, GalleryCompletionListComponent, GalleryDialogComponent, GalleryMentionFieldComponent, GalleryMenuComponent, GalleryPopoverComponent,
    GalleryQuickInputComponent, GallerySpecimenComponent, GalleryTooltipComponent
  ],
  templateUrl: "./gallery-overlays.component.html",
  styleUrl: "./gallery-overlays.component.css"
})
export class GalleryOverlaysComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly directions: typeof DockingDirection = DockingDirection;
}
