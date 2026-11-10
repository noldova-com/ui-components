/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { firstValueFrom, timer } from "rxjs";

import { TimerGlobalsFixture } from "./timer-globals.fixture";

describe("TimerGlobalsFixture", () => {
  function scope(): Record<string, unknown> {
    return { ...Object.fromEntries(TimerGlobalsFixture.NAMES.map(t => [t, (): string => t])), performance: { now: (): number => 0 } };
  }

  it("passes in this page, where every timer global is the page's own", () => {
    expect(() => TimerGlobalsFixture.ensureOwn()).not.toThrow();
  });

  it("fails naming each timer global a test left replaced, and puts the page's own back", () => {
    const globals = scope();
    const performance = globals["performance"] as Record<string, unknown>;
    const own = [globals["setInterval"], performance["now"]];
    TimerGlobalsFixture.record(globals);
    globals["setInterval"] = (): void => undefined;
    performance["now"] = (): number => 1;

    expect(() => TimerGlobalsFixture.ensureOwn(globals, () => undefined)).toThrow("This test left setInterval, performance.now replaced, which every later spec file in this page would get. "
      + "Restore what the test fakes or spies on before it ends: vi.restoreAllMocks() first, then vi.useRealTimers().");
    expect([globals["setInterval"], performance["now"]]).toEqual(own);
    expect(() => TimerGlobalsFixture.ensureOwn(globals, () => undefined)).not.toThrow();
  });

  it("keeps the first record of a page, so a later spec file can't record a global an earlier one left replaced", () => {
    const globals = scope();
    TimerGlobalsFixture.record(globals);
    globals["Date"] = (): void => undefined;
    TimerGlobalsFixture.record(globals);

    expect(() => TimerGlobalsFixture.ensureOwn(globals, () => undefined)).toThrow("This test left Date replaced");
  });

  it("fails when the page's own timer globals were never recorded", () => {
    expect(() => TimerGlobalsFixture.ensureOwn({}, () => undefined)).toThrow("The page's own timer globals were never recorded; the timer globals setup file must run first.");
  });

  it("fails the dead fake setInterval that restoring a spy after the real timers leaves, so the page's later timers run again", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    vi.spyOn(globalThis, "setInterval");
    vi.useRealTimers();
    vi.restoreAllMocks();

    expect(() => TimerGlobalsFixture.ensureOwn()).toThrow("This test left setInterval replaced");
    await expect(firstValueFrom(timer(0))).resolves.toBe(0);
  });

  it("leaves no spy restore that a later spec file's vi.restoreAllMocks() would run again", () => {
    const own = globalThis.setInterval;
    vi.restoreAllMocks();

    expect(globalThis.setInterval).toBe(own);
  });

  it("stops fake timers a test left on, then fails naming them", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    expect(() => TimerGlobalsFixture.ensureOwn()).toThrow("This test left setTimeout, clearTimeout replaced");
    expect(vi.isFakeTimers()).toBe(false);
  });
});
