/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// A time limit counted in turns of Node's event loop: a tick every 100 ms, ending the wait once the ticks add up to the limit. A loop stalled past
// the limit, as on a loaded runner, counts as one tick when it resumes, and the I/O that finished meanwhile is read before the next tick, so a
// refused connect or an ended listing is never taken for one that ran out. A wait that truly hangs still ends once the loop has turned for the limit.
export class LoopLimit {
  private static readonly TICK: number = 100;
  private readonly timer: NodeJS.Timeout;

  public constructor(limit: number, expire: () => void) {
    let left = Math.max(1, Math.ceil(limit / LoopLimit.TICK));
    this.timer = setInterval(() => {
      left--;
      if (left > 0)
        return;
      this.stop();
      expire();
    }, LoopLimit.TICK);
  }

  public stop(): void {
    clearInterval(this.timer);
  }
}
