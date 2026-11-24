/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GalleryCanvasComponent } from "./gallery-canvas.component.js";
import { GalleryFeedComponent } from "./gallery-feed.component.js";
import { GalleryGroupHeaderComponent } from "./gallery-group-header.component.js";
import { GalleryPanelCardComponent } from "./gallery-panel-card.component.js";
import { GallerySashComponent } from "./gallery-sash.component.js";
import { GallerySectionHeaderComponent } from "./gallery-section-header.component.js";
import { GallerySiteFooterComponent } from "./gallery-site-footer.component.js";
import { GallerySiteHeaderComponent } from "./gallery-site-header.component.js";
import { GalleryTabComponent } from "./gallery-tab.component.js";
import { GalleryToolbarButtonComponent } from "./gallery-toolbar-button.component.js";
import { GalleryToolbarComponent } from "./gallery-toolbar.component.js";
import { GalleryTreeComponent } from "./gallery-tree.component.js";
import { GalleryViewBadgeComponent } from "./gallery-view-badge.component.js";
import { GalleryVirtualListComponent } from "./gallery-virtual-list.component.js";

@Component({
  selector: "nol-gallery-navigation",
  imports: [GalleryCanvasComponent, GalleryFeedComponent, GalleryGroupHeaderComponent, GalleryPanelCardComponent, GallerySashComponent, GallerySectionHeaderComponent, GallerySiteFooterComponent,
    GallerySiteHeaderComponent, GalleryTabComponent, GalleryToolbarButtonComponent, GalleryToolbarComponent, GalleryTreeComponent, GalleryViewBadgeComponent, GalleryVirtualListComponent],
  templateUrl: "./gallery-navigation.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GalleryNavigationComponent {
}
