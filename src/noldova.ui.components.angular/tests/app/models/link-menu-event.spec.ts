/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkMenuEvent } from "../../../src/app/models/link-menu-event";

describe("LinkMenuEvent", () => {
  it("keeps the address and the event", () => {
    const event = new MouseEvent("contextmenu");
    const menu = new LinkMenuEvent("https://example.com/a", event);

    expect([menu.url, menu.event]).toEqual(["https://example.com/a", event]);
  });
});
