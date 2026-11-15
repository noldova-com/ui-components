/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { server } from "vitest/browser";

import { ChangeSignalFixture } from "./fixtures/change-signal.fixture";
import { HangLimitFixture } from "./fixtures/hang-limit.fixture";
import { LayoutSettleFixture } from "./fixtures/layout-settle.fixture";

describe("The specs' hang limit", () => {
  // A short bound stands in for the shared one, so the hung poll ends in a moment; the shared one ends the same way, halfway to the test's limit.
  const shortBound = 100;

  it("is the one limit vitest.config.mts sets for tests and hooks alike, not Vitest's browser defaults of 15 and 30 seconds", ({ task }) => {
    expect([server.config.testTimeout, server.config.hookTimeout, task.timeout]).toEqual([30_000, 30_000, 30_000]);
  });

  it("bounds every poll at half of it, not Vitest's 1-second default: expect.poll from vitest.config.mts, and vi.waitFor through the fixture", () => {
    expect([server.config.expect.poll?.timeout, HangLimitFixture.wait.timeout]).toEqual([15_000, 15_000]);
  });

  it("fails a poll that never passes once its bound runs out, naming what it waited for, so the poll fails before the test does", async () => {
    const isHung = (): boolean => true;

    await expect(vi.waitFor(() => expect(isHung(), "the hung condition").toBe(false), { timeout: shortBound })).rejects.toThrow("the hung condition");
    await expect(expect.poll(isHung, { timeout: shortBound, message: "the hung condition" }).toBe(false)).rejects.toThrow("the hung condition");
  });

  it("fails a wait on a change signal that never passes once its bound runs out, naming what it waited for, and checks nothing after", async () => {
    const changes = new ChangeSignalFixture();
    const check = vi.fn(() => expect(changes, "the hung condition").toBeNull());

    await expect(ChangeSignalFixture.untilAsync(check, listener => changes.listen(listener), shortBound)).rejects.toThrow("the hung condition");
    const checks = check.mock.calls.length;
    changes.fire();
    expect(check).toHaveBeenCalledTimes(checks);
  });

  it("fails a wait for a layout that never settles once its bound runs out, naming what it waited on and its last shape", async () => {
    let read = 0;
    const frameAsync = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()));

    await expect(LayoutSettleFixture.settledAsync("the moving row", () => String(read++), frameAsync, shortBound))
      .rejects.toThrow(new RegExp(`^the moving row kept changing for ${shortBound} ms; it last read \\d+\\.$`, "u"));
  });
});
