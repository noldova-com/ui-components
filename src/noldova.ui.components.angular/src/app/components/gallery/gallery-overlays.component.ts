/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { ButtonVariant } from "../../enums/button-variant.js";
import { DockingDirection } from "../../enums/docking-direction.js";
import { GallerySize } from "../../enums/gallery-size.js";
import { MentionCandidate } from "../../models/mention-candidate.js";
import { ButtonComponent } from "../button/button.component.js";
import { DockingGuideComponent } from "../docking-guide/docking-guide.component.js";
import { DockingPlateComponent } from "../docking-plate/docking-plate.component.js";
import { MentionFieldDirective } from "../mention-field/mention-field.directive.js";
import { MentionListComponent } from "../mention-field/mention-list.component.js";
import { PopoverDirective } from "../popover/popover.directive.js";
import { PopoverTriggerDirective } from "../popover/popover-trigger.directive.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryDialogComponent } from "./gallery-dialog.component.js";
import { GalleryMenuComponent } from "./gallery-menu.component.js";
import { GalleryQuickInputComponent } from "./gallery-quick-input.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";
import { GalleryTooltipComponent } from "./gallery-tooltip.component.js";

@Component({
  selector: "nol-gallery-overlays",
  imports: [
    ButtonComponent, DockingGuideComponent, DockingPlateComponent, GalleryCellComponent, GalleryDialogComponent, GalleryMenuComponent, GalleryQuickInputComponent, GallerySpecimenComponent,
    GalleryStateDirective, GalleryTooltipComponent, MentionFieldDirective, MentionListComponent, PopoverDirective, PopoverTriggerDirective
  ],
  templateUrl: "./gallery-overlays.component.html",
  styleUrl: "./gallery-overlays.component.css"
})
export class GalleryOverlaysComponent {
  private static count: number = 0;

  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly directions: typeof DockingDirection = DockingDirection;
  protected readonly hoveredMention: string = GalleryResources.hoveredMention;
  protected readonly mentionListId: string = GalleryOverlaysComponent.nextMentionListId();
  protected readonly hoveredMentionListId: string = GalleryOverlaysComponent.nextMentionListId();
  protected readonly longMentionListId: string = GalleryOverlaysComponent.nextMentionListId();
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
    return `${GalleryResources.mentionListIdPrefix}${GalleryOverlaysComponent.count++}`;
  }
}
