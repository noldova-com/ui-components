/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestTimeSource } from "./test-time-source";

describe("TestTimeSource", () => {
  it("moves its monotonic time with its clock, by the milliseconds it advances", () => {
    const source = new TestTimeSource(1000);
    const start = [source.now(), source.elapsed()];
    source.advance(250);

    expect([start, source.now(), source.elapsed()]).toEqual([[1000, 1000], 1250, 1250]);
  });

  it("runs on each runFrames the frames asked for before it, and keeps a frame asked for during it for the next", () => {
    const source = new TestTimeSource();
    const calls: string[] = [];
    source.frame(() => {
      calls.push("first");
      source.frame(() => calls.push("next"));
    });
    const pending = source.frameCount;
    source.runFrames();
    const ran = [...calls];
    source.runFrames();

    expect([pending, ran, calls, source.frameCount]).toEqual([1, ["first"], ["first", "next"], 0]);
  });

  it("runs no frame that was cancelled, even by an earlier frame of the same run", () => {
    const source = new TestTimeSource();
    const calls: string[] = [];
    source.frame(() => calls.push("cancelled"))();
    const cancelLater: { value: () => void } = { value: () => undefined };
    source.frame(() => {
      calls.push("first");
      cancelLater.value();
    });
    cancelLater.value = source.frame(() => calls.push("later"));
    source.runFrames();

    expect([calls, source.frameCount]).toEqual([["first"], 0]);
  });
});
