/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IResizeObservers } from "../interfaces/i-resize-observers.js";

export class BrowserResizeObservers implements IResizeObservers {
  public create(callback: ResizeObserverCallback): ResizeObserver {
    return new ResizeObserver(callback);
  }
}
