/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DestroyRef, type WritableSignal, inject, signal } from "@angular/core";

import { MessageAuthorKind } from "../../enums/message-author-kind.js";
import { MessageStatus } from "../../enums/message-status.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import { MessageAuthor } from "../../models/message-author.js";
import type { MessageBlock } from "../../models/message-block.js";
import { MessageText } from "../../models/message-text.js";
import { MessageComponent } from "../message/message.component.js";
import { GalleryResources } from "./gallery-resources.js";

@Component({
  selector: "nol-gallery-retry-message",
  imports: [MessageComponent],
  template: `<nol-message [author]="reviewer" [time]="time" [blocks]="stopped" [status]="retryStatus()" (retry)="retry()" />`
})
export class GalleryRetryMessageComponent {
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly timers: Set<() => void> = new Set();

  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly time: Date = new Date(Date.now() - GalleryResources.messageAgo);
  protected readonly reviewer: MessageAuthor = new MessageAuthor(this.text.messageReviewer, this.text.messageReviewer, MessageAuthorKind.Agent, null,
    this.text.messageReviewerInitials, GalleryResources.messageReviewerAccent);
  protected readonly stopped: readonly MessageBlock[] = [new MessageText(this.text.messageStopped)];
  protected readonly retryStatus: WritableSignal<MessageStatus> = signal(MessageStatus.Error);

  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const cancel of this.timers)
        cancel();
    });
  }

  protected retry(): void {
    this.retryStatus.set(MessageStatus.Streaming);
    const cancel = this.timeSource.after(() => {
      this.timers.delete(cancel);
      this.retryStatus.set(MessageStatus.Error);
    }, GalleryResources.messageRetryDelay);
    this.timers.add(cancel);
  }
}
