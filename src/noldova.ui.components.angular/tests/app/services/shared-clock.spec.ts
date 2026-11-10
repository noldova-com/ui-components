/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";

import { ClockTokens } from "../../../src/app/models/clock-tokens";
import { SharedClock } from "../../../src/app/services/shared-clock";
import { TestTimeSource } from "../../fixtures/test-time-source";

describe("SharedClock", () => {
  let source: TestTimeSource;

  beforeEach(() => {
    source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
  });

  it("gives the same ticker for the same interval and another for another", () => {
    const clock = TestBed.inject(SharedClock);

    expect([clock.every(1000) === clock.every(1000), clock.every(1000) === clock.every(30_000)]).toEqual([true, false]);
  });

  it("keeps one timer for each interval, each ticking at its own pace", () => {
    const clock = TestBed.inject(SharedClock);
    const slow = clock.every(30_000);
    const fast = clock.every(1000);
    const start = source.now();

    const releaseSlow = slow.watch();
    const releaseFast = fast.watch();
    const both = source.timerCount;
    source.advance(30_000);
    const moved = [slow.now() - start, fast.now() - start];
    releaseFast();

    expect([both, moved, source.timerCount]).toEqual([2, [30_000, 30_000], 1]);
    releaseSlow();
  });

  it("gives one midnight ticker on the same time source", () => {
    const clock = TestBed.inject(SharedClock);
    const release = clock.midnight.watch();

    expect([clock.midnight === TestBed.inject(SharedClock).midnight, source.timerCount]).toEqual([true, 1]);
    release();
  });

  it("stops every timer, the midnight one too, when its injector goes", () => {
    const clock = TestBed.inject(SharedClock);
    clock.every(30_000).watch();
    clock.every(1000).watch();
    clock.midnight.watch();

    TestBed.resetTestingModule();

    expect(source.timerCount).toBe(0);
  });
});
