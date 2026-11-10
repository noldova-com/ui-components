/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

export class ScrollEndFollower {
  private readonly distance: number;
  private top: number = 0;
  private isOn: boolean = true;

  public constructor(distance: number) {
    this.distance = distance;
  }

  public see(area: HTMLElement): void {
    const top = area.scrollTop;
    const fromEnd = area.scrollHeight - area.clientHeight - top;
    const isAtEnd = fromEnd < 1;
    if (top < this.top && !isAtEnd)
      this.isOn = false;
    else if (isAtEnd || (top > this.top && fromEnd <= this.distance))
      this.isOn = true;
    this.top = top;
  }

  public follow(area: HTMLElement): void {
    this.see(area);
    if (!this.isOn)
      return;
    area.scrollTop = area.scrollHeight;
    this.top = area.scrollTop;
  }
}
