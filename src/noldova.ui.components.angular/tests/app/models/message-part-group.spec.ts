/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageAttachment } from "../../../src/app/models/message-attachment";
import type { MessageBlock } from "../../../src/app/models/message-block";
import { MessagePart } from "../../../src/app/models/message-part";
import { MessagePartGroup } from "../../../src/app/models/message-part-group";
import { MessageSlot } from "../../../src/app/models/message-slot";
import { MessageText } from "../../../src/app/models/message-text";

describe("MessagePartGroup", () => {
  const groups = (blocks: readonly MessageBlock[], attached: readonly string[]): unknown[] =>
    MessagePartGroup.groupsOf(MessagePart.partsOf(blocks), new Set(attached)).map(t => [t.key, t.isAttached, t.parts.map(part => part.key)]);

  it("puts each part in a group of its own while no slot attaches", () => {
    expect(groups([new MessageText("a"), new MessageSlot("stopped"), new MessageAttachment("f", "a.txt", 1, "Text")], [])).toEqual([
      ["run-0", false, ["run-0"]], ["slot:stopped-0", false, ["slot:stopped-0"]], ["Attachment-0", false, ["Attachment-0"]]
    ]);
  });

  it("joins an attached slot, and each attached slot after it, to the group of the part before it, keyed by that part", () => {
    expect(groups([new MessageText("a"), new MessageSlot("stopped"), new MessageSlot("note"), new MessageSlot("card"), new MessageText("b")], ["stopped", "note"])).toEqual([
      ["run-0", true, ["run-0", "slot:stopped-0", "slot:note-0"]], ["slot:card-0", false, ["slot:card-0"]], ["run-1", false, ["run-1"]]
    ]);
  });

  it("starts a group of its own with an attached slot that is the first part, and never attaches a run", () => {
    expect(groups([new MessageSlot("stopped"), new MessageText("a")], ["stopped", "run"])).toEqual([["slot:stopped-0", false, ["slot:stopped-0"]], ["run-0", false, ["run-0"]]]);
  });

  it("makes no group of no parts", () => {
    expect(MessagePartGroup.groupsOf([], new Set(["stopped"]))).toEqual([]);
  });
});
