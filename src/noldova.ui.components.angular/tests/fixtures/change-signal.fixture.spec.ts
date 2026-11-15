/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ChangeSignalFixture } from "./change-signal.fixture";

describe("ChangeSignalFixture", () => {
  it("calls each listener on each firing, until the listener stops listening", () => {
    const changes = new ChangeSignalFixture();
    const heard: string[] = [];
    const stop = changes.listen(() => heard.push("first"));
    changes.listen(() => heard.push("second"));

    changes.fire();
    stop();
    changes.fire();

    expect(heard).toEqual(["first", "second", "second"]);
  });

  it("passes at once when its check already holds, giving what the check returned, and listens to nothing", async () => {
    const changes = new ChangeSignalFixture();
    const listen = vi.fn(() => () => undefined);

    const given = await ChangeSignalFixture.untilAsync(() => "ready", listen);

    expect([given, listen.mock.calls.length]).toEqual(["ready", 0]);
    expect(await changes.untilAsync(() => 1)).toBe(1);
  });

  it("checks again on each firing, passes on the one that makes its check hold, and stops listening then", async () => {
    const changes = new ChangeSignalFixture();
    let count = 0;
    const checked: number[] = [];
    const reached = changes.untilAsync(() => {
      checked.push(count);
      expect(count).toBe(2);
      return count;
    });
    count++;
    changes.fire();
    count++;
    changes.fire();
    count++;
    changes.fire();

    expect([await reached, checked]).toEqual([2, [0, 1, 2]]);
  });

  it("fails a wait whose check gives a promise, at once or on a later firing, and stops listening then", async () => {
    const changes = new ChangeSignalFixture();
    let isAsync = false;
    let checks = 0;

    await expect(changes.untilAsync(async () => 1)).rejects.toThrow(new TypeError("A wait's check runs at once and gives no promise; await the async work before the wait."));
    const later = changes.untilAsync(() => {
      checks++;
      if (isAsync)
        return Promise.reject(new Error("never seen"));
      throw new Error("not yet");
    });
    isAsync = true;
    changes.fire();

    await expect(later).rejects.toThrow(TypeError);
    changes.fire();
    expect(checks).toBe(2);
  });
});
