/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IElementWidths } from "../interfaces/i-element-widths.js";

export class DomElementWidths implements IElementWidths {
  public outer(element: HTMLElement): number {
    return element.offsetWidth;
  }

  public inner(element: HTMLElement): number {
    return element.clientWidth;
  }

  public viewport(): number {
    return window.innerWidth;
  }
}
