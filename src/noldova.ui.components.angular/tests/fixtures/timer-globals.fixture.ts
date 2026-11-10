/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { vi } from "vitest";

export class TimerGlobalsFixture {
  public static readonly NAMES: readonly string[] = ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "requestAnimationFrame", "cancelAnimationFrame",
    "requestIdleCallback", "cancelIdleCallback", "queueMicrotask", "Date", "performance.now"];
  private static readonly OWN: symbol = Symbol.for("noldova.timer-globals");

  public static record(scope: object = globalThis): void {
    const store = scope as Record<symbol, ReadonlyMap<string, unknown> | undefined>;
    store[TimerGlobalsFixture.OWN] ??= new Map(TimerGlobalsFixture.NAMES.map(t => [t, TimerGlobalsFixture.read(scope, t)]));
  }

  public static ensureOwn(scope: object = globalThis, stopFaking: () => void = TimerGlobalsFixture.stopFaking): void {
    const own = (scope as Record<symbol, ReadonlyMap<string, unknown> | undefined>)[TimerGlobalsFixture.OWN];
    if (own === undefined)
      throw new Error("The page's own timer globals were never recorded; the timer globals setup file must run first.");
    const replaced = [...own].filter(([name, value]) => TimerGlobalsFixture.read(scope, name) !== value).map(([name]) => name);
    if (replaced.length === 0)
      return;
    stopFaking();
    for (const name of replaced)
      TimerGlobalsFixture.write(scope, name, own.get(name));
    throw new Error(`This test left ${replaced.join(", ")} replaced, which every later spec file in this page would get. `
      + "Restore what the test fakes or spies on before it ends: vi.restoreAllMocks() first, then vi.useRealTimers().");
  }

  private static stopFaking(): void {
    if (vi.isFakeTimers())
      vi.useRealTimers();
  }

  private static read(scope: object, name: string): unknown {
    const [owner, key] = TimerGlobalsFixture.locate(scope, name);
    return owner?.[key];
  }

  private static write(scope: object, name: string, value: unknown): void {
    const [owner, key] = TimerGlobalsFixture.locate(scope, name);
    if (owner !== undefined)
      owner[key] = value;
  }

  private static locate(scope: object, name: string): [Record<string, unknown> | undefined, string] {
    const dot = name.indexOf(".");
    const globals = scope as Record<string, unknown>;
    return dot < 0 ? [globals, name] : [globals[name.slice(0, dot)] as Record<string, unknown> | undefined, name.slice(dot + 1)];
  }
}
