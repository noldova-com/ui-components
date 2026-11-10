/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ClockTicker } from "../../../src/app/services/clock-ticker";
import { TestTimeSource } from "../../fixtures/test-time-source";

describe("ClockTicker", () => {
  it.each([30_000, 1000])("runs one %i ms timer while anything watches it, moves on with it, and stops once the last watcher lets go, each only once", interval => {
    const source = new TestTimeSource();
    const ticker = new ClockTicker(interval, source);
    source.advance(400);
    const start = source.now();

    const first = ticker.watch();
    const second = ticker.watch();
    const third = ticker.watch();
    const watched = source.timerCount;
    source.advance(interval);
    const moved = ticker.now() - start;
    first();
    first();
    second();
    const kept = source.timerCount;
    source.advance(interval);
    const stillMoving = ticker.now() - start;
    third();
    const stopped = source.timerCount;
    source.advance(interval * 5);

    expect([watched, moved, kept, stillMoving, stopped, ticker.now() - start]).toEqual([1, interval, 1, interval * 2, 0, interval * 2]);
  });

  it("reads the time again when it starts once more", () => {
    const source = new TestTimeSource();
    const ticker = new ClockTicker(1000, source);
    ticker.watch()();
    source.advance(3_600_000);

    const release = ticker.watch();

    expect(ticker.now()).toBe(source.now());
    release();
  });

  it("stops its timer on request", () => {
    const source = new TestTimeSource();
    const ticker = new ClockTicker(1000, source);
    ticker.watch();

    ticker.stop();

    expect(source.timerCount).toBe(0);
  });
});
