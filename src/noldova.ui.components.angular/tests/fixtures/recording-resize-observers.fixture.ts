/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IResizeObservers } from "../../src/app/interfaces/i-resize-observers";

export class RecordingResizeObserversFixture implements IResizeObservers {
  private readonly notifiers: ((entries: ResizeObserverEntry[]) => void)[] = [];

  public get count(): number {
    return this.notifiers.length;
  }

  public create(callback: ResizeObserverCallback): ResizeObserver {
    const observer = new ResizeObserver(() => undefined);
    this.notifiers.push(entries => callback(entries, observer));
    return observer;
  }

  public notify(entries: readonly ResizeObserverEntry[]): void {
    this.notifiers.forEach(t => t([...entries]));
  }
}
