/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { ButtonVariant } from "../../enums/button-variant.js";
import { MessageAuthorKind } from "../../enums/message-author-kind.js";
import { MessageStatus } from "../../enums/message-status.js";
import { VirtualListEdge } from "../../enums/virtual-list-edge.js";
import { VirtualListKind } from "../../enums/virtual-list-kind.js";
import { ArrayVirtualListSource } from "../../models/array-virtual-list-source.js";
import { MessageAuthor } from "../../models/message-author.js";
import type { MessageBlock } from "../../models/message-block.js";
import { MessageText } from "../../models/message-text.js";
import { ButtonComponent } from "../button/button.component.js";
import { MessageComponent } from "../message/message.component.js";
import { VirtualListComponent } from "../virtual-list/virtual-list.component.js";
import { VirtualRowDirective } from "../virtual-list/virtual-row.directive.js";
import { GalleryMessage } from "./gallery-message.js";
import { GalleryResources } from "./gallery-resources.js";

@Component({
  selector: "nol-gallery-newest-feed",
  imports: [ButtonComponent, MessageComponent, VirtualListComponent, VirtualRowDirective],
  templateUrl: "./gallery-newest-feed.component.html",
  styleUrl: "./gallery-feed.component.css"
})
export class GalleryNewestFeedComponent {
  private added: number = GalleryResources.feedNewestLength;

  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly kinds: typeof VirtualListKind = VirtualListKind;
  protected readonly edges: typeof VirtualListEdge = VirtualListEdge;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly time: Date = new Date(Date.now() - GalleryResources.messageAgo);
  protected readonly reviewer: MessageAuthor = new MessageAuthor(this.text.messageReviewer, this.text.messageReviewer, MessageAuthorKind.Agent, null,
    this.text.messageReviewerInitials, GalleryResources.messageReviewerAccent);
  protected readonly person: MessageAuthor = new MessageAuthor(this.text.feedAuthors[0], this.text.feedAuthors[0], MessageAuthorKind.Person);
  protected readonly continued: readonly MessageBlock[] = [new MessageText(this.text.messageContinued)];
  protected readonly newestMessages: ArrayVirtualListSource<GalleryMessage> = new ArrayVirtualListSource(Array.from({ length: GalleryResources.feedNewestLength }, (_, t) =>
    new GalleryMessage(`newest-${GalleryResources.feedNewestLength - t}`, t % 2 === 0 ? this.reviewer : this.person, new Date(this.time.getTime() - t * GalleryResources.feedNewestStep),
      this.continued, MessageStatus.Complete)), t => t.key, GalleryResources.virtualListEstimate);

  protected addNewest(): void {
    this.added++;
    this.newestMessages.insert(0, [new GalleryMessage(`newest-${this.added}`, this.reviewer, new Date(), this.continued, MessageStatus.Complete)]);
  }
}
