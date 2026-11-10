/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Injectable, inject } from "@angular/core";

import "@noldova/context.core";

import type { ITimeSource } from "../interfaces/i-time-source.js";
import { ClockTokens } from "../models/clock-tokens.js";
import { TooltipTokens } from "../models/tooltip-tokens.js";
import { TooltipPaceResources } from "./tooltip-pace.resources.js";

@Injectable({ providedIn: "root" })
export class TooltipPace {
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly restDelay: number = inject(TooltipTokens.restDelay);
  private closedAt: number | null = null;
  private cancelWaiting: (() => void) | null = null;

  public schedule(show: () => void, isOtherShown: boolean): () => void {
    this.cancel();
    const cancel = this.timeSource.after(() => {
      this.cancelWaiting = null;
      show();
    }, this.delayFor(isOtherShown));
    this.cancelWaiting = cancel;
    return () => {
      if (this.cancelWaiting === cancel)
        this.cancel();
    };
  }

  public get isWaiting(): boolean {
    return !Object.isNull(this.cancelWaiting);
  }

  public cancel(): void {
    this.cancelWaiting?.();
    this.cancelWaiting = null;
  }

  public close(): void {
    this.closedAt = this.timeSource.elapsed();
  }

  private delayFor(isOtherShown: boolean): number {
    if (isOtherShown || (!Object.isNull(this.closedAt) && this.timeSource.elapsed() - this.closedAt <= TooltipPaceResources.tooltipNextWindow))
      return 0;
    return this.restDelay;
  }
}
