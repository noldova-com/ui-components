/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { MessageAuthorKind } from "../../enums/message-author-kind.js";
import type { LinkReference } from "../../models/link-reference.js";
import type { LinkReferenceState } from "../../models/link-reference-state.js";
import { MessageAuthor } from "../../models/message-author.js";
import type { MessageBlock } from "../../models/message-block.js";
import { MessageText } from "../../models/message-text.js";
import { LinkReferenceCardComponent } from "../link-reference/link-reference-card.component.js";
import { LinkReferenceChipComponent } from "../link-reference/link-reference-chip.component.js";
import { MessageComponent } from "../message/message.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryMessageComponent } from "./gallery-message.component.js";
import { GalleryReferences } from "./gallery-references.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";
import { GalleryVirtualFeedComponent } from "./gallery-virtual-feed.component.js";

@Component({
  selector: "nol-gallery-feed",
  imports: [GalleryCellComponent, GalleryMessageComponent, GallerySpecimenComponent, GalleryStateDirective, GalleryVirtualFeedComponent, LinkReferenceCardComponent,
    LinkReferenceChipComponent, MessageComponent],
  templateUrl: "./gallery-feed.component.html",
  styleUrl: "./gallery-feed.component.css"
})
export class GalleryFeedComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly time: Date = new Date(Date.now() - GalleryResources.messageAgo);
  protected readonly reviewer: MessageAuthor = new MessageAuthor(this.text.messageReviewer, this.text.messageReviewer, MessageAuthorKind.Agent, null,
    this.text.messageReviewerInitials, GalleryResources.messageReviewerAccent);
  protected readonly references: GalleryReferences = new GalleryReferences();
  protected readonly referenced: readonly MessageBlock[] = [new MessageText(this.text.referenceStatesText)];
  protected readonly runs: readonly MessageBlock[] = [new MessageText(this.text.referenceRunsText)];
  protected readonly moreKinds: readonly MessageBlock[] = [new MessageText(this.text.referenceMoreKindsText)];
  protected readonly marked: readonly MessageBlock[] = [new MessageText(this.text.referenceMarksText)];
  protected readonly reading: readonly MessageBlock[] = [new MessageText(this.text.referenceReadingText)];
  protected readonly longReference: readonly MessageBlock[] = [new MessageText(this.text.referenceLongText)];
  protected readonly pullRequest: LinkReference = GalleryReferences.pullRequest;
  protected readonly pullUrl: string = GalleryResources.referencePull.url;
  protected readonly issue: LinkReference = GalleryReferences.issue;
  protected readonly run: LinkReference = GalleryReferences.run;
  protected readonly mergeRequest: LinkReference = GalleryReferences.mergeRequest;
  protected readonly workItem: LinkReference = GalleryReferences.workItem;
  protected readonly commit: LinkReference = GalleryReferences.commit;
  protected readonly bug: LinkReferenceState = GalleryReferences.bug;
  protected readonly commitState: LinkReferenceState = GalleryReferences.commitState;
  protected readonly open: LinkReferenceState = GalleryReferences.open;
  protected readonly failed: LinkReferenceState = GalleryReferences.failed;
}
