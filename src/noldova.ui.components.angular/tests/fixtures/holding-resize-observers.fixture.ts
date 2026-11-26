/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IResizeObservers } from "../../src/app/interfaces/i-resize-observers";

export class HoldingResizeObserversFixture implements IResizeObservers {
  public readonly held: (() => void)[] = [];
  public isHolding: boolean = true;

  public create(callback: ResizeObserverCallback): ResizeObserver {
    return new ResizeObserver((entries, observer) => this.isHolding ? this.held.push(() => callback(entries, observer)) : callback(entries, observer));
  }

  public release(): void {
    this.isHolding = false;
    this.held.splice(0).forEach(t => t());
  }
}
