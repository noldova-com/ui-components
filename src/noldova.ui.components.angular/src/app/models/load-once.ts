/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import type { ITimeSource } from "../interfaces/i-time-source.js";

export class LoadOnce<T> {
  private readonly failureHold: number;
  private readonly timeSource: ITimeSource;
  private loading: Promise<T> | null = null;
  private loaded: readonly [T] | null = null;

  public constructor(failureHold: number, timeSource: ITimeSource) {
    this.failureHold = failureHold;
    this.timeSource = timeSource;
  }

  public getAsync(loadAsync: () => Promise<T>): Promise<T> {
    if (Object.isNull(this.loading)) {
      const loading = loadAsync();
      this.loading = loading;
      void loading.then(t => {
        this.loaded = [t];
      }, () => this.timeSource.after(() => {
        this.loading = null;
      }, this.failureHold));
    }
    return this.loading;
  }

  public whenLoaded(use: (value: T) => void): void {
    void this.loading?.then(use, () => undefined);
  }

  public ifLoaded<U>(use: (value: T) => U): U | undefined {
    return Object.isNull(this.loaded) ? undefined : use(this.loaded[0]);
  }
}
