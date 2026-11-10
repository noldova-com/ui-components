/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { MessageAuthorKind } from "../../enums/message-author-kind.js";
import { MessageStatus } from "../../enums/message-status.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { MessageAuthor } from "../../models/message-author.js";
import type { MessageBlock } from "../../models/message-block.js";
import { MessageCode } from "../../models/message-code.js";
import { MessageText } from "../../models/message-text.js";
import { VirtualListSource } from "../../models/virtual-list-source.js";
import { GalleryMessage } from "./gallery-message.js";
import { GalleryResources } from "./gallery-resources.js";

export class GalleryFeedSource extends VirtualListSource<GalleryMessage> {
  private static readonly authors: readonly MessageAuthor[] = GalleryResources.text.feedAuthors.map((t, i) => new MessageAuthor(String(i), t, MessageAuthorKind.Person, null, null, i + 1));
  private static readonly replyAuthor: MessageAuthor = new MessageAuthor(GalleryResources.text.feedReplyAuthor, GalleryResources.text.feedReplyAuthor, MessageAuthorKind.Agent,
    null, null, GalleryResources.feedReplyAccent);

  private readonly delay: number;
  private readonly timeSource: ITimeSource;
  private readonly newest: number;
  private readonly history: number;
  private readonly replies: Map<number, GalleryMessage> = new Map();

  public constructor(length: number, delay: number, newest: number, timeSource: ITimeSource) {
    super(length);
    this.delay = delay;
    this.timeSource = timeSource;
    this.newest = newest;
    this.history = length;
  }

  public readAsync(start: number, end: number): Promise<readonly GalleryMessage[]> {
    const messages = Array.from({ length: end - start }, (_, t) => this.messageAt(start + t));
    if (start >= this.length() - GalleryResources.feedRecent)
      return Promise.resolve(messages);
    return new Promise(t => this.timeSource.after(() => t(messages), this.delay));
  }

  public keyOf(item: GalleryMessage): string {
    return item.key;
  }

  public startReply(time: Date): number {
    const index = this.length();
    this.replies.set(index, new GalleryMessage(String(index), GalleryFeedSource.replyAuthor, time, [], MessageStatus.Streaming));
    this.reportInserted(index, 1);
    return index;
  }

  public extendReply(index: number, word: string): GalleryMessage {
    const text = this.messageAt(index).blocks.map(t => t.text).join(String.empty);
    const extended = text === String.empty ? word : `${text} ${word}`;
    return this.updateReply(index, [new MessageText(extended)], MessageStatus.Streaming);
  }

  public finishReply(index: number): GalleryMessage {
    return this.updateReply(index, this.messageAt(index).blocks, MessageStatus.Complete);
  }

  private generate(index: number): GalleryMessage {
    const { feedWords, codeLanguage } = GalleryResources.text;
    const author = GalleryFeedSource.authors[index % GalleryFeedSource.authors.length] as MessageAuthor;
    const count = 4 + index * 7 % 40;
    const [first, ...rest] = Array.from({ length: count }, (_, t) => feedWords[(index + t) % feedWords.length]);
    const blocks: MessageBlock[] = [new MessageText(GalleryResources.formatFeedText(String(first), rest.join(" ")))];
    if (index % GalleryResources.feedCodeEvery === 4)
      blocks.push(new MessageCode(GalleryResources.formatFeedCode(index), codeLanguage));
    const time = new Date(this.newest - (this.history - 1 - index) * GalleryResources.feedSpacing);
    return new GalleryMessage(String(index), author, time, blocks, MessageStatus.Complete);
  }

  private updateReply(index: number, blocks: readonly MessageBlock[], status: MessageStatus): GalleryMessage {
    const reply = this.messageAt(index).withBlocks(blocks, status);
    this.replies.set(index, reply);
    this.reportUpdated(index, 1);
    return reply;
  }

  private messageAt(index: number): GalleryMessage {
    return this.replies.get(index) ?? this.generate(index);
  }
}
