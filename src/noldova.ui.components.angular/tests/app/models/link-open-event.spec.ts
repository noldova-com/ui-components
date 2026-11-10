/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LinkGesture } from "../../../src/app/enums/link-gesture";
import { LinkOpenEvent } from "../../../src/app/models/link-open-event";
import { Resources } from "../../../src/resources";

describe("LinkOpenEvent", () => {
  const url = "https://example.com/a";

  it("keeps the address and the event, and reads the gesture from the event: middle for the middle button, modified with Ctrl or Cmd, plain otherwise", () => {
    const events: readonly (readonly [MouseEvent | KeyboardEvent, LinkGesture])[] = [
      [new MouseEvent("click"), LinkGesture.Plain], [new MouseEvent("click", { shiftKey: true, altKey: true }), LinkGesture.Plain],
      [new MouseEvent("click", { ctrlKey: true }), LinkGesture.Modified], [new MouseEvent("click", { metaKey: true }), LinkGesture.Modified],
      [new MouseEvent("auxclick", { button: Resources.middleButton }), LinkGesture.Middle], [new MouseEvent("auxclick", { button: Resources.middleButton, metaKey: true }), LinkGesture.Middle],
      [new KeyboardEvent("keydown", { key: Resources.enterKey }), LinkGesture.Plain], [new KeyboardEvent("keydown", { key: Resources.enterKey, shiftKey: true }), LinkGesture.Plain],
      [new KeyboardEvent("keydown", { key: Resources.enterKey, ctrlKey: true }), LinkGesture.Modified], [new KeyboardEvent("keydown", { key: Resources.enterKey, metaKey: true }), LinkGesture.Modified]
    ];

    expect(events.map(([event]) => new LinkOpenEvent(url, event)).map(t => [t.url, t.gesture, t.event])).toEqual(events.map(([event, gesture]) => [url, gesture, event]));
  });
});
