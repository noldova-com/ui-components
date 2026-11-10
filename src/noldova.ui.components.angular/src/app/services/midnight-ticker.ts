/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type Signal, type WritableSignal, signal } from "@angular/core";

import "@noldova/context.core";

import type { ITimeSource } from "../interfaces/i-time-source.js";
import { MidnightTickerResources } from "./midnight-ticker.resources.js";

export class MidnightTicker {
  private readonly current: WritableSignal<number>;
  private readonly timeSource: ITimeSource;
  private cancel: (() => void) | null = null;
  private watchers: number = 0;

  public readonly today: Signal<number>;

  public constructor(timeSource: ITimeSource) {
    this.timeSource = timeSource;
    this.current = signal(MidnightTicker.dayOf(timeSource.now()));
    this.today = this.current.asReadonly();
  }

  public static dayOf(time: number): number {
    const day = new Date(time);
    day.setHours(0, 0, 0, 0);
    return day.getTime();
  }

  public watch(): () => void {
    if (this.watchers++ === 0)
      this.schedule();
    let isWatching = true;
    return () => {
      if (!isWatching)
        return;
      isWatching = false;
      if (--this.watchers === 0)
        this.halt();
    };
  }

  public stop(): void {
    this.halt();
  }

  private schedule(): void {
    const now = this.timeSource.now();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    this.current.set(MidnightTicker.dayOf(now));
    this.cancel = this.timeSource.after(() => this.schedule(), Math.min(next.getTime() - now, MidnightTickerResources.midnightRecheckInterval));
  }

  private halt(): void {
    this.cancel?.();
    this.cancel = null;
  }
}
