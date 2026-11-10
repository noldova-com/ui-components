/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ListenedEvents } from "../../../src/app/models/listened-events";

describe("ListenedEvents", () => {
  it("says whether anything listens and gives each value to every listener still subscribed", () => {
    const listened = new ListenedEvents<number>();
    const heard: string[] = [];
    const before = listened.isListened();
    const first = listened.events.subscribe(t => heard.push(`first ${t}`));
    listened.events.subscribe(t => heard.push(`second ${t}`));
    listened.emit(1);
    first.unsubscribe();
    const after = listened.isListened();
    listened.emit(2);

    expect([before, after, heard]).toEqual([false, true, ["first 1", "second 1", "second 2"]]);
  });

  it("counts the same callback subscribed twice as two listeners, and listens to nothing once both unsubscribe", () => {
    const listened = new ListenedEvents<void>();
    const callback = (): void => undefined;
    const first = listened.events.subscribe(callback);
    const second = listened.events.subscribe(callback);
    first.unsubscribe();
    const one = listened.isListened();
    second.unsubscribe();

    expect([one, listened.isListened()]).toEqual([true, false]);
  });
});
