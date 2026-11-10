/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GalleryMessage } from "../../../../src/app/components/gallery/gallery-message";
import { MessageAuthorKind } from "../../../../src/app/enums/message-author-kind";
import { MessageStatus } from "../../../../src/app/enums/message-status";
import { MessageAuthor } from "../../../../src/app/models/message-author";
import { MessageText } from "../../../../src/app/models/message-text";

describe("GalleryMessage", () => {
  it("keeps its key, author, time, blocks and status, and gives a copy with other blocks and status under the same key", () => {
    const author = new MessageAuthor("a", "Sample Author 1", MessageAuthorKind.Person);
    const time = new Date(0);
    const blocks = [new MessageText("Ready")];
    const message = new GalleryMessage("7", author, time, [], MessageStatus.Streaming);
    const done = message.withBlocks(blocks, MessageStatus.Complete);

    expect([message.key, message.author, message.time, message.blocks, message.status]).toEqual(["7", author, time, [], MessageStatus.Streaming]);
    expect([done.key, done.author, done.time, done.blocks, done.status]).toEqual(["7", author, time, blocks, MessageStatus.Complete]);
  });
});
