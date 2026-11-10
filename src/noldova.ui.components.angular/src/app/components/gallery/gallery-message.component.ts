/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DestroyRef, type Signal, type WritableSignal, inject, signal, viewChild } from "@angular/core";

import { AvatarColor } from "../../enums/avatar-color.js";
import { ChipKind } from "../../enums/chip-kind.js";
import { GallerySize } from "../../enums/gallery-size.js";
import { MessageAuthorKind } from "../../enums/message-author-kind.js";
import { MessageFooterPlacement } from "../../enums/message-footer-placement.js";
import { MessageLayout } from "../../enums/message-layout.js";
import { MessageStatus } from "../../enums/message-status.js";
import { MessageTimeFormat } from "../../enums/message-time-format.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import { MentionCandidate } from "../../models/mention-candidate.js";
import { MessageAttachment } from "../../models/message-attachment.js";
import { MessageAttachmentPicture } from "../../models/message-attachment-picture.js";
import { MessageAuthor } from "../../models/message-author.js";
import type { MessageBlock } from "../../models/message-block.js";
import { MessageCode } from "../../models/message-code.js";
import { MessageSlot } from "../../models/message-slot.js";
import { MessageText } from "../../models/message-text.js";
import { ChipComponent } from "../chip/chip.component.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { MessageActionDirective } from "../message/message-action.directive.js";
import { MessageFooterEndDirective } from "../message/message-footer-end.directive.js";
import { MessageImageDirective } from "../message/message-image.directive.js";
import { MessageSlotDirective } from "../message/message-slot.directive.js";
import { MessageComponent } from "../message/message.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-message",
  imports: [ChipComponent, GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, IconButtonComponent, MessageActionDirective, MessageComponent, MessageFooterEndDirective,
    MessageImageDirective, MessageSlotDirective],
  templateUrl: "./gallery-message.component.html",
  styleUrl: "./gallery-feed.component.css"
})
export class GalleryMessageComponent {
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly timers: Set<() => void> = new Set();

  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly statuses: typeof MessageStatus = MessageStatus;
  protected readonly layouts: typeof MessageLayout = MessageLayout;
  protected readonly footerPlacements: typeof MessageFooterPlacement = MessageFooterPlacement;
  protected readonly chipKinds: typeof ChipKind = ChipKind;
  protected readonly timeFormats: typeof MessageTimeFormat = MessageTimeFormat;
  protected readonly retryStatus: WritableSignal<MessageStatus> = signal(MessageStatus.Error);
  protected readonly slot: Signal<MessageSlotDirective> = viewChild.required(MessageSlotDirective);
  protected readonly time: Date = new Date(Date.now() - GalleryResources.messageAgo);
  protected readonly actionsTop: string = GalleryResources.messageActionsTop;
  protected readonly actionsEnd: string = GalleryResources.messageActionsEnd;
  protected readonly reviewer: MessageAuthor = new MessageAuthor(this.text.messageReviewer, this.text.messageReviewer, MessageAuthorKind.Agent, null,
    this.text.messageReviewerInitials, GalleryResources.messageReviewerAccent);
  protected readonly person: MessageAuthor = new MessageAuthor(this.text.feedAuthors[0], this.text.feedAuthors[0], MessageAuthorKind.Person);
  protected readonly assistant: MessageAuthor = new MessageAuthor(this.text.feedReplyAuthor, this.text.feedReplyAuthor, MessageAuthorKind.Agent, null, null, null, AvatarColor.Teal);
  protected readonly app: MessageAuthor = new MessageAuthor(this.text.messageApp, this.text.messageApp, MessageAuthorKind.System);
  protected readonly mentions: readonly MentionCandidate[] = [new MentionCandidate(this.text.messageReviewer, this.text.messageReviewer)];
  protected readonly columnBlocks: readonly MessageBlock[] = [new MessageText(this.text.messageInterim, true), new MessageText(this.text.messageColumnText)];
  protected readonly answer: readonly MessageBlock[] = [new MessageText(this.text.messageText), new MessageCode(this.text.messageCode, this.text.messageCodeLanguage)];
  protected readonly continued: readonly MessageBlock[] = [new MessageText(this.text.messageContinued)];
  protected readonly attached: readonly MessageBlock[] = [
    new MessageAttachment(this.text.messageAttachmentId, this.text.messageAttachmentName, GalleryResources.messageAttachmentSize, this.text.messageAttachmentType),
    new MessageSlot(this.text.messageSlotId)
  ];
  protected readonly pictureAttached: readonly MessageBlock[] = [
    new MessageAttachment(this.text.messagePictureId, this.text.messagePictureName, GalleryResources.messagePictureSize, this.text.messagePictureType, null, null,
      new MessageAttachmentPicture(GalleryResources.messagePicture, GalleryResources.messagePictureWidth, GalleryResources.messagePictureHeight)),
    new MessageText(this.text.messagePictureText)
  ];
  protected readonly hovered: readonly MessageBlock[] = [
    new MessageText(this.text.messageContinued),
    new MessageAttachment(this.text.messageAttachmentId, this.text.messageAttachmentName, GalleryResources.messageAttachmentSize, this.text.messageAttachmentType)
  ];
  protected readonly partial: readonly MessageBlock[] = [new MessageText(this.text.messagePartial)];
  protected readonly stopped: readonly MessageBlock[] = [new MessageText(this.text.messageStopped)];
  protected readonly pictured: readonly MessageBlock[] = [new MessageText(this.text.messageImageText)];
  protected readonly linked: readonly MessageBlock[] = [new MessageText(this.text.messageFileLinksText)];
  protected readonly linkedFolders: ReadonlySet<string> = new Set(this.text.messageFileLinksFolders);
  protected readonly long: readonly MessageBlock[] = [new MessageText(Array.from({ length: GalleryResources.messageLongParagraphs }, () => this.text.messageLong).join(GalleryResources.messageParagraphBreak))];

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
