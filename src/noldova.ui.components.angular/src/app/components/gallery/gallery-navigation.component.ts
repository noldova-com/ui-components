/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { ToolbarButtonComponent } from "../toolbar-button/toolbar-button.component.js";
import { ToolbarItemDirective } from "../toolbar/toolbar-item.directive.js";
import { ToolbarDirective } from "../toolbar/toolbar.directive.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryFeedComponent } from "./gallery-feed.component.js";
import { GalleryGroupHeaderComponent } from "./gallery-group-header.component.js";
import { GalleryPanelCardComponent } from "./gallery-panel-card.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySashComponent } from "./gallery-sash.component.js";
import { GallerySectionHeaderComponent } from "./gallery-section-header.component.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";
import { GalleryTabComponent } from "./gallery-tab.component.js";
import { GalleryToolbarButtonComponent } from "./gallery-toolbar-button.component.js";
import { GalleryTreeComponent } from "./gallery-tree.component.js";
import { GalleryViewBadgeComponent } from "./gallery-view-badge.component.js";
import { GalleryVirtualListComponent } from "./gallery-virtual-list.component.js";

@Component({
  selector: "nol-gallery-navigation",
  imports: [GalleryCellComponent, GalleryFeedComponent, GalleryGroupHeaderComponent, GalleryPanelCardComponent, GallerySashComponent, GallerySectionHeaderComponent, GallerySpecimenComponent,
    GalleryStateDirective, GalleryTabComponent, GalleryToolbarButtonComponent, GalleryTreeComponent, GalleryViewBadgeComponent, GalleryVirtualListComponent, IconButtonComponent, ToolbarButtonComponent,
    ToolbarDirective, ToolbarItemDirective, TooltipDirective],
  templateUrl: "./gallery-navigation.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GalleryNavigationComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
}
