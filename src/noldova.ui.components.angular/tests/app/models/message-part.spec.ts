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

  it("keeps a run's key from the run that held one of its keyed texts before, when a run before it goes", () => {
    const slot = new MessageSlot("plan");
    const last = new MessageText("c", false, "c");
    const before = MessagePart.partsOf([new MessageText("a", false, "a"), slot, new MessageText("b", false, "b"), last]);

    expect([before.map(t => t.key), MessagePart.partsOf([slot, last], before).map(t => t.key)]).toEqual([["run-0", "slot:plan-0", "run-1"], ["slot:plan-0", "run-1"]]);
  });

  it("gives a run with no kept key the first run key no kept run holds, and a run whose earlier run's key went to a run before it a new one", () => {
    const first = new MessageText("a", false, "a");
    const second = new MessageText("b", false, "b");
    const before = MessagePart.partsOf([first, new MessageCode("x"), second]);

    const added = MessagePart.partsOf([new MessageText("new"), new MessageSlot("card"), first], before).map(t => t.key);
    const split = MessagePart.partsOf([first, new MessageSlot("card"), second], before).map(t => t.key);

    expect([before.map(t => t.key), added, split]).toEqual([["run-0"], ["run-1", "slot:card-0", "run-0"], ["run-0", "slot:card-0", "run-1"]]);
  });

  it("gives two runs joined by the going of the slot between them the earlier run's key", () => {
    const first = new MessageText("a", false, "a");
    const last = new MessageText("c", false, "c");
    const before = MessagePart.partsOf([first, new MessageSlot("card"), last]);

    const joined = MessagePart.partsOf([first, last], before).map(t => [t.key, t.blocks]);

    expect([before.map(t => t.key), joined]).toEqual([["run-0", "slot:card-0", "run-1"], [["run-0", [first, last]]]]);
  });

  it("makes no part of no blocks, and one part of blocks without text", () => {
    const slot = new MessageSlot("card");

    expect([MessagePart.partsOf([]), MessagePart.partsOf([slot]).map(t => [t.isRun, t.blocks])]).toEqual([[], [[false, [slot]]]]);
  });
});
