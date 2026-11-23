/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { LinkReferenceTone } from "../../models/link-reference-tone.js";
import { LinkReferenceWorkItemState } from "../../models/link-reference-work-item-state.js";
import { LinkReferenceWorkItemStateComponent } from "../link-reference/link-reference-work-item-state.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-link-reference-work-item-state",
  imports: [GalleryCellComponent, GallerySpecimenComponent, LinkReferenceWorkItemStateComponent],
  templateUrl: "./gallery-link-reference-work-item-state.component.html",
  styleUrl: "./gallery-feed.component.css"
})
export class GalleryLinkReferenceWorkItemStateComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly active: LinkReferenceWorkItemState = new LinkReferenceWorkItemState(this.text.referenceActive,
    new LinkReferenceTone(GalleryResources.referenceActiveColor, GalleryResources.referenceActiveColor));
  protected readonly resolved: LinkReferenceWorkItemState = new LinkReferenceWorkItemState(this.text.referenceResolved,
    new LinkReferenceTone(GalleryResources.referenceOpenColor, GalleryResources.referenceOpenColor));
  protected readonly long: LinkReferenceWorkItemState = new LinkReferenceWorkItemState(this.text.referenceLongState,
    new LinkReferenceTone(GalleryResources.referenceDraftColor, GalleryResources.referenceDraftColor));
}
