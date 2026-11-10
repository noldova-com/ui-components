/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import { Component, DestroyRef, type WritableSignal, inject, signal } from "@angular/core";

import { ButtonVariant } from "../../enums/button-variant.js";
import { GallerySize } from "../../enums/gallery-size.js";
import { MessageAuthorKind } from "../../enums/message-author-kind.js";
import { MessageStatus } from "../../enums/message-status.js";
import { VirtualListEdge } from "../../enums/virtual-list-edge.js";
import { VirtualListKind } from "../../enums/virtual-list-kind.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { ArrayVirtualListSource } from "../../models/array-virtual-list-source.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import type { LinkReference } from "../../models/link-reference.js";
import type { LinkReferenceState } from "../../models/link-reference-state.js";
import { MessageAuthor } from "../../models/message-author.js";
import type { MessageBlock } from "../../models/message-block.js";
import { MessageText } from "../../models/message-text.js";
import { ButtonComponent } from "../button/button.component.js";
import { LinkReferenceCardComponent } from "../link-reference/link-reference-card.component.js";
import { LinkReferenceChipComponent } from "../link-reference/link-reference-chip.component.js";
import { MessageComponent } from "../message/message.component.js";
import { VirtualListComponent } from "../virtual-list/virtual-list.component.js";
import { VirtualRowDirective } from "../virtual-list/virtual-row.directive.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryFeedSource } from "./gallery-feed-source.js";
import { GalleryMessage } from "./gallery-message.js";
import { GalleryMessageComponent } from "./gallery-message.component.js";
import { GalleryReferences } from "./gallery-references.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-feed",
  imports: [ButtonComponent, GalleryCellComponent, GalleryMessageComponent, GallerySpecimenComponent, GalleryStateDirective, LinkReferenceCardComponent, LinkReferenceChipComponent,
    MessageComponent, NgTemplateOutlet, VirtualListComponent, VirtualRowDirective],
  templateUrl: "./gallery-feed.component.html",
  styleUrl: "./gallery-feed.component.css"
})
export class GalleryFeedComponent {
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly timers: Set<() => void> = new Set();
  private added: number = GalleryResources.feedNewestLength;

  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly kinds: typeof VirtualListKind = VirtualListKind;
  protected readonly edges: typeof VirtualListEdge = VirtualListEdge;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly replies: WritableSignal<number> = signal(0);
  protected readonly messages: GalleryFeedSource = new GalleryFeedSource(GalleryResources.feedLength, GalleryResources.feedReadDelay, Date.now(), this.timeSource);
  protected readonly slowMessages: GalleryFeedSource = new GalleryFeedSource(GalleryResources.feedLength, GalleryResources.feedSlowDelay, Date.now(), this.timeSource);
  protected readonly time: Date = new Date(Date.now() - GalleryResources.messageAgo);
  protected readonly reviewer: MessageAuthor = new MessageAuthor(this.text.messageReviewer, this.text.messageReviewer, MessageAuthorKind.Agent, null,
    this.text.messageReviewerInitials, GalleryResources.messageReviewerAccent);
  protected readonly person: MessageAuthor = new MessageAuthor(this.text.feedAuthors[0], this.text.feedAuthors[0], MessageAuthorKind.Person);
  protected readonly continued: readonly MessageBlock[] = [new MessageText(this.text.messageContinued)];
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
  protected readonly focusedFeed: string = GalleryResources.focusedFeed;
  protected readonly shortMessages: ArrayVirtualListSource<GalleryMessage> = new ArrayVirtualListSource([
    new GalleryMessage("first", this.person, this.time, this.continued, MessageStatus.Complete),
    new GalleryMessage("second", this.reviewer, this.time, this.continued, MessageStatus.Complete)
  ], t => t.key, GalleryResources.virtualListEstimate);
  protected readonly longMessages: ArrayVirtualListSource<GalleryMessage> = new ArrayVirtualListSource([
    new GalleryMessage("long", this.person, this.time, [new MessageText(this.text.feedLongText)], MessageStatus.Complete)
  ], t => t.key, GalleryResources.virtualListEstimate);
  protected readonly newestMessages: ArrayVirtualListSource<GalleryMessage> = new ArrayVirtualListSource(Array.from({ length: GalleryResources.feedNewestLength }, (_, t) =>
    new GalleryMessage(`newest-${GalleryResources.feedNewestLength - t}`, t % 2 === 0 ? this.reviewer : this.person, new Date(this.time.getTime() - t * GalleryResources.feedNewestStep),
      this.continued, MessageStatus.Complete)), t => t.key, GalleryResources.virtualListEstimate);

  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const cancel of this.timers)
        cancel();
    });
  }

  protected addNewest(): void {
    this.added++;
    this.newestMessages.insert(0, [new GalleryMessage(`newest-${this.added}`, this.reviewer, new Date(), this.continued, MessageStatus.Complete)]);
  }

  protected streamReply(): void {
    const index = this.messages.startReply(new Date());
    this.replies.update(t => t + 1);
    const { feedWords } = this.text;
    let step = 0;
    const cancel = this.timeSource.every(() => {
      this.messages.extendReply(index, String(feedWords[step % feedWords.length]));
      step++;
      if (step < GalleryResources.feedReplyWords)
        return;
      cancel();
      this.timers.delete(cancel);
      this.messages.finishReply(index);
      this.replies.update(t => t - 1);
    }, GalleryResources.feedReplyInterval);
    this.timers.add(cancel);
  }
}
