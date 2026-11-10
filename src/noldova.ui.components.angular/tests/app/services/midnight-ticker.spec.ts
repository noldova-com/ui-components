/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MidnightTicker } from "../../../src/app/services/midnight-ticker";
import { TestTimeSource } from "../../fixtures/test-time-source";

describe("MidnightTicker", () => {
  const lastSecond = (): number => {
    const next = new Date(Date.UTC(2026, 9, 13, 10, 0, 0));
    next.setHours(24, 0, 0, 0);
    return next.getTime() - 1000;
  };
  const dayAfter = (day: number): number => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return next.getTime();
  };

  it("gives the start of the local day", () => {
    const start = new Date(2026, 9, 13, 0, 0, 0, 0).getTime();

    expect([MidnightTicker.dayOf(start), MidnightTicker.dayOf(new Date(2026, 9, 13, 23, 59, 59, 999).getTime())]).toEqual([start, start]);
  });

  it("runs one timer to midnight while anything watches it, moves on to the next day there and sets it again, and stops once the last watcher lets go, each only once", () => {
    const source = new TestTimeSource(lastSecond());
    const ticker = new MidnightTicker(source);
    const today = ticker.today();

    const first = ticker.watch();
    const second = ticker.watch();
    const watched = source.timerCount;
    source.advance(999);
    const beforeMidnight = ticker.today();
    source.advance(1);
    const afterMidnight = [ticker.today(), source.timerCount];
    first();
    first();
    const kept = source.timerCount;
    second();

    expect([today, watched, beforeMidnight, afterMidnight, kept, source.timerCount]).toEqual([MidnightTicker.dayOf(lastSecond()), 1, today, [dayAfter(today), 1], 1, 0]);
  });

  it("moves on to the day the clock shows within an hour when the clock passes midnight without its timer firing, as after a sleep", () => {
    const source = new TestTimeSource(new Date(2026, 9, 13, 10, 0, 0, 0).getTime());
    const ticker = new MidnightTicker(source);
    const today = ticker.today();
    const release = ticker.watch();

    source.jump(24 * 3_600_000);
    const slept = ticker.today();
    source.advance(3_600_000);

    expect([slept, ticker.today(), source.timerCount]).toEqual([today, dayAfter(today), 1]);
    release();
  });

  it("reads the day again when it starts once more", () => {
    const source = new TestTimeSource(lastSecond());
    const ticker = new MidnightTicker(source);
    const today = ticker.today();
    ticker.watch()();
    source.advance(2000);
    const unwatched = ticker.today();

    const release = ticker.watch();

    expect([unwatched, ticker.today()]).toEqual([today, dayAfter(today)]);
    release();
  });

  it("stops its timer on request", () => {
    const source = new TestTimeSource();
    const ticker = new MidnightTicker(source);
    ticker.watch();

    ticker.stop();

    expect(source.timerCount).toBe(0);
  });
});
