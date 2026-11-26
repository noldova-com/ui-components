/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IResizeObservers } from "../../src/app/interfaces/i-resize-observers";

export class CountingResizeObserversFixture implements IResizeObservers {
  public count: number = 0;

  public create(callback: ResizeObserverCallback): ResizeObserver {
    this.count++;
    return new ResizeObserver(callback);
  }
}
