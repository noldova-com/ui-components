/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, type WritableSignal, effect, inject, input, signal } from "@angular/core";

import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import { RevealDelayResources } from "./reveal-delay.resources.js";

@Directive({
  host: {
    "[class.nol-reveal-pending]": "isPending()"
  }
})
export class RevealDelayDirective {
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly pending: WritableSignal<boolean> = signal(false);

  public readonly isDelayed = input<boolean>(false);
  public readonly isPending = this.pending.asReadonly();

  public constructor() {
    effect(onCleanup => {
      if (!this.isDelayed()) {
        this.pending.set(false);
        return;
      }
      this.pending.set(true);
      onCleanup(this.timeSource.after(() => this.pending.set(false), RevealDelayResources.revealDelay));
    });
  }
}
