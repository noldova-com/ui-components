/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { HangLimitFixture } from "./hang-limit.fixture";

// A signal a test double fires each time its state changes, so a spec waits on the change rather than polling for it.
export class ChangeSignalFixture {
  private readonly listeners: Set<() => void> = new Set();

  // Waits until a check passes, running it at once and again each time the listened-to signals fire, and gives what it returned. It runs on
  // no clock but its bound, and at the bound it fails with the check's own failure, so the message says what it waited for, as vi.waitFor does.
  // The check runs at once: an async check would pass on its promise before it ran, so a check that gives a promise fails the wait.
  public static untilAsync<T>(check: () => T, listen: (recheck: () => void) => () => void, limit: number = HangLimitFixture.wait.timeout): Promise<T> {
    return new Promise((resolve, reject) => {
      let failure: unknown;
      const passes = (): boolean => {
        try {
          const value = check();
          if (value instanceof Promise) {
            value.catch(() => undefined);
            reject(new TypeError("A wait's check runs at once and gives no promise; await the async work before the wait."));
            return true;
          }
          resolve(value);
          return true;
        } catch (error: unknown) {
          failure = error;
          return false;
        }
      };
      if (passes())
        return;

      const recheck = (): void => {
        if (passes())
          stop();
      };
      let unlisten: () => void = () => undefined;
      const stop = (): void => {
        clearTimeout(deadline);
        unlisten();
      };
      const deadline = setTimeout(() => {
        stop();
        reject(failure);
      }, limit);
      unlisten = listen(recheck);
    });
  }

  public listen(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public fire(): void {
    for (const listener of [...this.listeners])
      listener();
  }

  public untilAsync<T>(check: () => T): Promise<T> {
    return ChangeSignalFixture.untilAsync(check, listener => this.listen(listener));
  }
}
