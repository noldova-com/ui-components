/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, Injectable, inject } from "@angular/core";

import "@noldova/context.core";

import type { ITimeSource } from "../interfaces/i-time-source.js";
import { ClockTokens } from "../models/clock-tokens.js";
import { ClockTicker } from "./clock-ticker.js";
import { MidnightTicker } from "./midnight-ticker.js";

@Injectable({ providedIn: "root" })
export class SharedClock {
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly tickers: Map<number, ClockTicker> = new Map();

  public readonly midnight: MidnightTicker = new MidnightTicker(this.timeSource);

  public constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.tickers.forEach(t => t.stop());
      this.midnight.stop();
    });
  }

  public every(interval: number): ClockTicker {
    let ticker = this.tickers.get(interval);
    if (Object.isUndefined(ticker)) {
      ticker = new ClockTicker(interval, this.timeSource);
      this.tickers.set(interval, ticker);
    }
    return ticker;
  }
}
