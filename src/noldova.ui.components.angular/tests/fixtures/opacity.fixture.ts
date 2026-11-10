/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class OpacityFixture {
  public static drawn(element: Element | null): number {
    let opacity = 1;
    for (; element !== null; element = element.parentElement)
      opacity *= Number(getComputedStyle(element).opacity);
    return opacity;
  }
}
