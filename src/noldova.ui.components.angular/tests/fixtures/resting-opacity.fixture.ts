/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DomChangeFixture } from "./dom-change.fixture";

// Waits after a change until an element's opacity rests at a value, with no animation running on it, and gives the value. Its first read
// must already show the change, the value or a running animation, so a style that didn't follow the change fails at once rather than passing
// late; then it reads again on each change DomChangeFixture listens to, a transition's end among them, so it waits on the style rather than on
// frames or time. Each failure names every read: the value, the animations running, and the time and frames since the wait began.
export class RestingOpacityFixture {
  private readonly element: () => Element;
  private readonly expected: string;
  private readonly start: number = performance.now();
  private readonly reads: string[] = [];
  private frames: number = 0;
  private frame: number = 0;

  // Reads the opacity and gives it once it rests at the value; until then it fails naming every read so far.
  public readonly read = (): string => {
    const [value, running] = this.record();
    if (running > 0 || value !== this.expected)
      throw new Error(`The opacity didn't rest at ${this.expected}; its reads: ${this.reads.join("; ")}.`);
    return value;
  };

  // Reads the opacity once and fails, naming the read, unless it shows the change: the value, or an animation running.
  public readonly follows = (): void => {
    const [value, running] = this.record();
    if (running === 0 && value !== this.expected)
      throw new Error(`The opacity didn't follow the change to ${this.expected}; its reads: ${this.reads.join("; ")}.`);
  };

  private readonly count = (): void => {
    this.frames++;
    this.frame = requestAnimationFrame(this.count);
  };

  public constructor(element: () => Element, expected: string) {
    this.element = element;
    this.expected = expected;
  }

  public static async atAsync(element: () => Element, expected: string): Promise<string> {
    const wait = new RestingOpacityFixture(element, expected);
    wait.follows();
    wait.frame = requestAnimationFrame(wait.count);
    try {
      return await DomChangeFixture.untilAsync(wait.read);
    } finally {
      cancelAnimationFrame(wait.frame);
    }
  }

  private record(): readonly [string, number] {
    const running = this.element().getAnimations().length;
    const value = getComputedStyle(this.element()).opacity;
    this.reads.push(`${value} with ${running} running at ${Math.round(performance.now() - this.start)} ms, frame ${this.frames}`);
    return [value, running];
  }
}
