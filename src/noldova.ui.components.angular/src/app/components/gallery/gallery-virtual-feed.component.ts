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
import { VirtualListKind } from "../../enums/virtual-list-kind.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { ArrayVirtualListSource } from "../../models/array-virtual-list-source.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import { MessageAuthor } from "../../models/message-author.js";
import type { MessageBlock } from "../../models/message-block.js";
import { MessageText } from "../../models/message-text.js";
import { ButtonComponent } from "../button/button.component.js";
import { MessageComponent } from "../message/message.component.js";
import { VirtualListComponent } from "../virtual-list/virtual-list.component.js";
import { VirtualRowDirective } from "../virtual-list/virtual-row.directive.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryFeedSource } from "./gallery-feed-source.js";
import { GalleryMessage } from "./gallery-message.js";
import { GalleryNewestFeedComponent } from "./gallery-newest-feed.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-virtual-feed",
  imports: [ButtonComponent, GalleryCellComponent, GalleryNewestFeedComponent, GallerySpecimenComponent, GalleryStateDirective, MessageComponent, NgTemplateOutlet, VirtualListComponent,
    VirtualRowDirective],
  templateUrl: "./gallery-virtual-feed.component.html",
  styleUrl: "./gallery-feed.component.css"
})
export class GalleryVirtualFeedComponent {
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly timers: Set<() => void> = new Set();

  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly kinds: typeof VirtualListKind = VirtualListKind;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly replies: WritableSignal<number> = signal(0);
  protected readonly messages: GalleryFeedSource = new GalleryFeedSource(GalleryResources.feedLength, GalleryResources.feedReadDelay, Date.now(), this.timeSource);
  protected readonly slowMessages: GalleryFeedSource = new GalleryFeedSource(GalleryResources.feedLength, GalleryResources.feedSlowDelay, Date.now(), this.timeSource);
  protected readonly time: Date = new Date(Date.now() - GalleryResources.messageAgo);
  protected readonly reviewer: MessageAuthor = new MessageAuthor(this.text.messageReviewer, this.text.messageReviewer, MessageAuthorKind.Agent, null,
    this.text.messageReviewerInitials, GalleryResources.messageReviewerAccent);
  protected readonly person: MessageAuthor = new MessageAuthor(this.text.feedAuthors[0], this.text.feedAuthors[0], MessageAuthorKind.Person);
  protected readonly continued: readonly MessageBlock[] = [new MessageText(this.text.messageContinued)];
  protected readonly focusedFeed: string = GalleryResources.focusedFeed;
  protected readonly shortMessages: ArrayVirtualListSource<GalleryMessage> = new ArrayVirtualListSource([
    new GalleryMessage("first", this.person, this.time, this.continued, MessageStatus.Complete),
    new GalleryMessage("second", this.reviewer, this.time, this.continued, MessageStatus.Complete)
  ], t => t.key, GalleryResources.virtualListEstimate);
  protected readonly longMessages: ArrayVirtualListSource<GalleryMessage> = new ArrayVirtualListSource([
    new GalleryMessage("long", this.person, this.time, [new MessageText(this.text.feedLongText)], MessageStatus.Complete)
  ], t => t.key, GalleryResources.virtualListEstimate);

  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const cancel of this.timers)
        cancel();
    });
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
