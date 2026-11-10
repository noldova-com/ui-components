/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageBlockKind } from "../../../src/app/enums/message-block-kind";
import { MessageAttachment } from "../../../src/app/models/message-attachment";

describe("MessageAttachment", () => {
  it("keeps a file's id, name, size, type, preview and tooltip, and gives its name as its text", () => {
    const plain = new MessageAttachment("f1", "a.txt", 12, "Text");
    const shown = new MessageAttachment("f2", "b.png", 2048, "PNG image", "https://example.com/b.png", "/repo/b.png");

    expect([plain, shown].map(t => [t.kind, t.id, t.name, t.size, t.type, t.preview, t.tooltip, t.text])).toEqual([
      [MessageBlockKind.Attachment, "f1", "a.txt", 12, "Text", null, null, "a.txt"], [MessageBlockKind.Attachment, "f2", "b.png", 2048, "PNG image", "https://example.com/b.png", "/repo/b.png", "b.png"]
    ]);
  });
});
