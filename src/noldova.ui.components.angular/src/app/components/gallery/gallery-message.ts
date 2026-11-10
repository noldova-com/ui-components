/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { MessageStatus } from "../../enums/message-status.js";
import type { MessageAuthor } from "../../models/message-author.js";
import type { MessageBlock } from "../../models/message-block.js";

export class GalleryMessage {
  public readonly key: string;
  public readonly author: MessageAuthor;
  public readonly time: Date;
  public readonly blocks: readonly MessageBlock[];
  public readonly status: MessageStatus;

  public constructor(key: string, author: MessageAuthor, time: Date, blocks: readonly MessageBlock[], status: MessageStatus) {
    this.key = key;
    this.author = author;
    this.time = time;
    this.blocks = blocks;
    this.status = status;
  }

  public withBlocks(blocks: readonly MessageBlock[], status: MessageStatus): GalleryMessage {
    return new GalleryMessage(this.key, this.author, this.time, blocks, status);
  }
}
