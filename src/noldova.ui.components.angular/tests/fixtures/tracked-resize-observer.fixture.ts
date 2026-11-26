/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TrackedResizeObserverFixture extends ResizeObserver {
  public readonly callback: ResizeObserverCallback;
  public readonly unobserved: Element[] = [];
  public disconnects: number = 0;

  public constructor(callback: ResizeObserverCallback) {
    super(callback);
    this.callback = callback;
  }

  public override unobserve(target: Element): void {
    this.unobserved.push(target);
    super.unobserve(target);
  }

  public override disconnect(): void {
    this.disconnects++;
    super.disconnect();
  }
}
