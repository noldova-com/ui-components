/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ChangeSignalFixture } from "./change-signal.fixture";

// Waits until an element's opacity rests at a value, with no animation running on it, and gives the value. It reads again on each mutation in
// the document and each transition event, so it waits on the style rather than on frames or time, and fails at the shared bound naming every
// read: the value, the animations running, and the time and frames since the wait began, so a style that came late, a transition that started
// late and a wrong resting value read apart.
export class RestingOpacityFixture {
  private static readonly MUTATIONS: MutationObserverInit = { attributes: true, characterData: true, childList: true, subtree: true };
  private static readonly EVENTS: readonly string[] = ["transitionrun", "transitionstart", "transitionend", "transitioncancel"];

  private readonly element: () => Element;
  private readonly expected: string;
  private readonly start: number = performance.now();
  private readonly reads: string[] = [];
  private frames: number = 0;
  private frame: number = 0;

  // Reads the opacity and gives it once it rests at the value; until then it fails naming every read so far.
  public readonly read = (): string => {
    const running = this.element().getAnimations().length;
    const value = getComputedStyle(this.element()).opacity;
    this.reads.push(`${value} with ${running} running at ${Math.round(performance.now() - this.start)} ms, frame ${this.frames}`);
    if (running > 0 || value !== this.expected)
      throw new Error(`The opacity didn't rest at ${this.expected}; its reads: ${this.reads.join("; ")}.`);
    return value;
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
    wait.frame = requestAnimationFrame(wait.count);
    try {
      return await ChangeSignalFixture.untilAsync(wait.read, RestingOpacityFixture.listen);
    } finally {
      cancelAnimationFrame(wait.frame);
    }
  }

  private static listen(recheck: () => void): () => void {
    const mutations = new MutationObserver(recheck);
    mutations.observe(document, RestingOpacityFixture.MUTATIONS);
    for (const name of RestingOpacityFixture.EVENTS)
      document.addEventListener(name, recheck, true);
    return () => {
      mutations.disconnect();
      for (const name of RestingOpacityFixture.EVENTS)
        document.removeEventListener(name, recheck, true);
    };
  }
}
