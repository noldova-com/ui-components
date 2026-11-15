/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SystemTimeSource } from "../../../src/app/services/system-time-source";
import { SystemTimeSourceResources } from "../../../src/app/services/system-time-source.resources";
import { ChangeSignalFixture } from "../../fixtures/change-signal.fixture";

describe("SystemTimeSource", () => {
  it("reads the system's time", () => {
    const before = Date.now();
    const read = new SystemTimeSource().now();

    expect([read >= before, read <= Date.now()]).toEqual([true, true]);
  });

  it("reads the page's monotonic time, which a change of the system's clock doesn't move", () => {
    const before = performance.now();
    const read = new SystemTimeSource().elapsed();

    expect([read >= before, read <= performance.now()]).toEqual([true, true]);
  });

  it("calls back on its interval until it is cancelled", async () => {
    const source = new SystemTimeSource();
    let calls = 0;
    let later = 0;
    const changes = new ChangeSignalFixture();
    const cancel = source.every(() => {
      calls++;
      changes.fire();
    }, 5);
    const watcher = source.every(() => {
      later++;
      changes.fire();
    }, 5);

    await changes.untilAsync(() => expect(calls).toBeGreaterThanOrEqual(2));
    cancel();
    const stopped = calls;
    const mark = later;
    await changes.untilAsync(() => expect(later).toBeGreaterThanOrEqual(mark + 3));
    watcher();

    expect(calls).toBe(stopped);
  });

  it("calls back once after its delay, and not at all once cancelled", async () => {
    const source = new SystemTimeSource();
    const calls: string[] = [];
    const changes = new ChangeSignalFixture();
    const call = (name: string) => (): void => {
      calls.push(name);
      changes.fire();
    };
    source.after(call("once"), 5);
    source.after(call("cancelled"), 5)();
    source.after(call("later"), 20);

    await changes.untilAsync(() => expect(calls).toContain("later"));

    expect(calls).toEqual(["once", "later"]);
  });

  it("calls back on the next frame, and not at all once cancelled", async () => {
    const source = new SystemTimeSource();
    const calls: string[] = [];
    const changes = new ChangeSignalFixture();
    const call = (name: string) => (): void => {
      calls.push(name);
      changes.fire();
    };
    source.frame(call("cancelled"))();
    source.frame(call("frame"));

    await changes.untilAsync(() => expect(calls).toContain("frame"));

    expect(calls).toEqual(["frame"]);
  });

  it("calls back when the browser's idle callback comes, and not at all once cancelled", () => {
    const pending = new Map<number, IdleRequestCallback>();
    let requests = 0;
    const request = vi.spyOn(globalThis, "requestIdleCallback").mockImplementation(callback => {
      requests++;
      pending.set(requests, callback);
      return requests;
    });
    const cancel = vi.spyOn(globalThis, "cancelIdleCallback").mockImplementation(id => {
      pending.delete(id);
    });
    try {
      const source = new SystemTimeSource();
      const calls: string[] = [];
      source.idle(() => calls.push("cancelled"))();
      source.idle(() => calls.push("idle"));
      const before = [...calls];
      for (const callback of pending.values())
        callback({ didTimeout: false, timeRemaining: () => 50 });

      expect([before, calls, request.mock.calls.length, cancel.mock.calls]).toEqual([[], ["idle"], 2, [[1]]]);
    } finally {
      request.mockRestore();
      cancel.mockRestore();
    }
  });

  it("calls back after 100 milliseconds where the browser has no idle callback, and not at all once cancelled", async () => {
    vi.stubGlobal("requestIdleCallback", undefined);
    try {
      const source = new SystemTimeSource();
      const after = vi.spyOn(source, "after");
      const calls: string[] = [];
      const changes = new ChangeSignalFixture();
      const call = (name: string) => (): void => {
        calls.push(name);
        changes.fire();
      };
      source.idle(call("cancelled"))();
      source.idle(call("idle"));

      await changes.untilAsync(() => expect(calls).toContain("idle"));

      expect([calls, after.mock.calls.map(t => t[1])]).toEqual([["idle"], [SystemTimeSourceResources.idleFallbackDelay, SystemTimeSourceResources.idleFallbackDelay]]);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
