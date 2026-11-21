/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class CanvasBox {
  public readonly left: number;
  public readonly top: number;
  public readonly width: number;
  public readonly height: number;

  public constructor(left: number, top: number, width: number, height: number) {
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }

  public get right(): number {
    return this.left + this.width;
  }

  public get bottom(): number {
    return this.top + this.height;
  }

  public contains(box: CanvasBox): boolean {
    return box.left >= this.left && box.top >= this.top && box.right <= this.right && box.bottom <= this.bottom;
  }

  public overlaps(box: CanvasBox): boolean {
    return box.left < this.right && box.right > this.left && box.top < this.bottom && box.bottom > this.top;
  }
}
