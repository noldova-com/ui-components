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

export class ClockTicker {
  private readonly current: WritableSignal<number>;
  private readonly timeSource: ITimeSource;
  private readonly interval: number;
  private cancel: (() => void) | null = null;
  private watchers: number = 0;

  public readonly now: Signal<number>;

  public constructor(interval: number, timeSource: ITimeSource) {
    this.interval = interval;
    this.timeSource = timeSource;
    this.current = signal(timeSource.now());
    this.now = this.current.asReadonly();
  }

  public watch(): () => void {
    if (this.watchers++ === 0) {
      this.current.set(this.timeSource.now());
      this.cancel = this.timeSource.every(() => this.current.set(this.timeSource.now()), this.interval);
    }
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

  private halt(): void {
    this.cancel?.();
    this.cancel = null;
  }
}
