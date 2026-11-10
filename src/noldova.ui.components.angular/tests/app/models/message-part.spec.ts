/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageAttachment } from "../../../src/app/models/message-attachment";
import type { MessageBlock } from "../../../src/app/models/message-block";
import { MessageCode } from "../../../src/app/models/message-code";
import { MessagePart } from "../../../src/app/models/message-part";
import { MessageSlot } from "../../../src/app/models/message-slot";
import { MessageText } from "../../../src/app/models/message-text";

describe("MessagePart", () => {
  it("groups each run of text and code into one part, and gives every other block a part of its own, in order", () => {
    const text = new MessageText("a");
    const code = new MessageCode("b");
    const slot = new MessageSlot("card");
    const file = new MessageAttachment("f", "a.txt", 1, "Text");
    const last = new MessageText("c");

    const parts = MessagePart.partsOf([text, code, slot, file, last]).map(t => [t.isRun, t.blocks]);

    expect(parts).toEqual([[true, [text, code]], [false, [slot]], [false, [file]], [true, [last]]]);
  });

  it("keys each part by its kind, or its slot's id, and how many parts of that key come before it, so a part added before another of its own kind leaves that one's key", () => {
    const text = new MessageText("a");
    const keys = (blocks: readonly MessageBlock[]): readonly string[] => MessagePart.partsOf(blocks).map(t => t.key);

    expect([keys([text, new MessageSlot("working")]), keys([new MessageSlot("activity"), text]),
      keys([text, new MessageSlot("card"), new MessageAttachment("f", "a.txt", 1, "Text"), new MessageCode("b"), new MessageSlot("card"), new MessageAttachment("g", "b.txt", 1, "Text")])])
      .toEqual([["run-0", "slot:working-0"], ["slot:activity-0", "run-0"], ["run-0", "slot:card-0", "Attachment-0", "run-1", "slot:card-1", "Attachment-1"]]);
  });

  it("makes no part of no blocks, and one part of blocks without text", () => {
    const slot = new MessageSlot("card");

    expect([MessagePart.partsOf([]), MessagePart.partsOf([slot]).map(t => [t.isRun, t.blocks])]).toEqual([[], [[false, [slot]]]]);
  });
});
