/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { MentionCandidate } from "../../models/mention-candidate.js";
import { MentionFieldDirective } from "../mention-field/mention-field.directive.js";
import { MentionListComponent } from "../mention-field/mention-list.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-mention-field",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, MentionFieldDirective, MentionListComponent],
  templateUrl: "./gallery-mention-field.component.html",
  styleUrl: "./gallery-overlays.component.css"
})
export class GalleryMentionFieldComponent {
  private static count: number = 0;

  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly hoveredMention: string = GalleryResources.hoveredMention;
  protected readonly mentionListId: string = GalleryMentionFieldComponent.nextMentionListId();
  protected readonly hoveredMentionListId: string = GalleryMentionFieldComponent.nextMentionListId();
  protected readonly longMentionListId: string = GalleryMentionFieldComponent.nextMentionListId();
  protected readonly mentions: readonly MentionCandidate[] = [
    new MentionCandidate("person-1", GalleryResources.text.mentionAda, { section: GalleryResources.text.mentionPeople }),
    new MentionCandidate("person-2", GalleryResources.text.mentionAdrian, { section: GalleryResources.text.mentionPeople, note: GalleryResources.text.mentionAdrianNote, unavailable: true }),
    new MentionCandidate("agent-1", GalleryResources.text.mentionAssistant, { section: GalleryResources.text.mentionAgents })
  ];
  protected readonly longMentions: readonly MentionCandidate[] = [
    new MentionCandidate("agent-2", GalleryResources.text.mentionLong),
    new MentionCandidate("person-3", GalleryResources.text.mentionLongNoted, { note: GalleryResources.text.mentionAdrianNote, unavailable: true })
  ];

  private static nextMentionListId(): string {
    return `${GalleryResources.mentionListIdPrefix}${GalleryMentionFieldComponent.count++}`;
  }
}
