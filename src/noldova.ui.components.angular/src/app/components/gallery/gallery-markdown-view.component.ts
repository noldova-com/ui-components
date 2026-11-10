/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { MentionCandidate } from "../../models/mention-candidate.js";
import { MarkdownViewComponent } from "../markdown-view/markdown-view.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";

@Component({
  selector: "nol-gallery-markdown-view",
  imports: [GalleryCellComponent, GallerySpecimenComponent, MarkdownViewComponent],
  templateUrl: "./gallery-markdown-view.component.html",
  styleUrl: "./gallery-content.component.css"
})
export class GalleryMarkdownViewComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly mentions: readonly MentionCandidate[] = [
    new MentionCandidate("person-1", GalleryResources.text.mentionAda),
    new MentionCandidate("person-2", GalleryResources.text.mentionAdrian, { unavailable: true })
  ];
}
