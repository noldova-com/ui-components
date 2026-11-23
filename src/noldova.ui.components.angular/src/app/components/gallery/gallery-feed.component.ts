/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GalleryLinkReferenceChipComponent } from "./gallery-link-reference-chip.component.js";
import { GalleryLinkReferenceWorkItemStateComponent } from "./gallery-link-reference-work-item-state.component.js";
import { GalleryMessageComponent } from "./gallery-message.component.js";
import { GalleryVirtualFeedComponent } from "./gallery-virtual-feed.component.js";

@Component({
  selector: "nol-gallery-feed",
  imports: [GalleryLinkReferenceChipComponent, GalleryLinkReferenceWorkItemStateComponent, GalleryMessageComponent, GalleryVirtualFeedComponent],
  templateUrl: "./gallery-feed.component.html",
  styleUrl: "./gallery-feed.component.css"
})
export class GalleryFeedComponent {
}
