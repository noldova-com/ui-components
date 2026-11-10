/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MessageMenuRequest } from "../../../src/app/models/message-menu-request";

describe("MessageMenuRequest", () => {
  it("keeps the point to open the menu at, how the person asked, the part to open it on and the event it answers", () => {
    const point = new DOMRect(40, 120, 0, 0);
    const target = document.createElement("button");
    const event = new KeyboardEvent("keydown", { key: "ContextMenu" });
    const request = new MessageMenuRequest(point, "keyboard", target, event);

    expect([request.point === point, request.origin, request.target === target, request.event === event]).toEqual([true, "keyboard", true, true]);
  });

  it("keeps the id of the attachment it was on, and none when it is given none", () => {
    const event = new MouseEvent("contextmenu", { button: 2 });
    const target = document.createElement("button");

    expect([new MessageMenuRequest(new DOMRect(), "mouse", target, event, "f1").attachmentId, new MessageMenuRequest(new DOMRect(), "mouse", target, event).attachmentId])
      .toEqual(["f1", null]);
  });
});
