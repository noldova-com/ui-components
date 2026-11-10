/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageBlockKind } from "../../../src/app/enums/message-block-kind";
import { MessageText } from "../../../src/app/models/message-text";

describe("MessageText", () => {
  it("keeps its Markdown as its text", () => {
    const block = new MessageText("**a**");

    expect([block.kind, block.text]).toEqual([MessageBlockKind.Text, "**a**"]);
  });
});
