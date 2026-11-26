/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IResizeObservers } from "../../src/app/interfaces/i-resize-observers";
import { TrackedResizeObserverFixture } from "./tracked-resize-observer.fixture";

export class TrackingResizeObserversFixture implements IResizeObservers {
  public readonly made: TrackedResizeObserverFixture[] = [];

  public create(callback: ResizeObserverCallback): ResizeObserver {
    const observer = new TrackedResizeObserverFixture(callback);
    this.made.push(observer);
    return observer;
  }
}
