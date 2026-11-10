/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { Resources } from "../../resources.js";
import { TextRevealResources } from "./text-reveal.resources.js";

export class TextReveal {
  private readonly changed: (count: number) => void;
  private shown: number;
  private available: number;
  private isEnded: boolean = false;
  private frame: number | null = null;
  private previous: number | null = null;

  public constructor(initial: number, changed: (count: number) => void) {
    this.changed = changed;
    this.shown = initial;
    this.available = initial;
  }

  public get count(): number {
    return Math.floor(this.shown);
  }

  public follow(available: number, isEnded: boolean, animate: boolean): void {
    this.available = available;
    this.isEnded = isEnded;
    if (!animate || available < this.shown)
      this.shown = available;
    this.schedule();
  }

  public dispose(): void {
    if (!Object.isNull(this.frame))
      cancelAnimationFrame(this.frame);
    this.frame = null;
    this.previous = null;
  }

  private schedule(): void {
    if (Object.isNull(this.frame) && this.shown < this.available)
      this.frame = requestAnimationFrame(time => this.step(time));
  }

  private step(time: number): void {
    this.frame = null;
    if (!this.isEnded && !Object.isNull(this.previous) && time - this.previous < TextRevealResources.markdownRevealBurst) {
      this.schedule();
      return;
    }
    const before = this.count;
    this.advance(Object.isNull(this.previous) ? 0 : time - this.previous);
    this.previous = this.shown < this.available ? time : null;
    if (this.count !== before)
      this.changed(this.count);
    this.schedule();
  }

  private advance(elapsed: number): void {
    const backlog = this.available - this.shown;
    const constant = this.isEnded ? TextRevealResources.markdownRevealEndedCatchUp : TextRevealResources.markdownRevealCatchUp;
    const share = backlog * (1 - Math.exp(-elapsed / constant));
    const floor = TextRevealResources.markdownRevealMinimumRate * elapsed / Resources.millisecondsPerSecond;
    const revealed = Math.min(backlog, Math.max(share, floor));
    this.shown = revealed >= backlog ? this.available : this.shown + revealed;
  }
}
