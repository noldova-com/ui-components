/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageBlockKind } from "../../../src/app/enums/message-block-kind";
import { MessageSlot } from "../../../src/app/models/message-slot";

describe("MessageSlot", () => {
  it("names the app's template it shows, and has no text", () => {
    const block = new MessageSlot("card");

    expect([block.kind, block.id, block.text]).toEqual([MessageBlockKind.Slot, "card", ""]);
  });
});
