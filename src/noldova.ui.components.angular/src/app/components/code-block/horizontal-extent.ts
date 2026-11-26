/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class HorizontalExtent {
  public readonly left: number;
  public readonly right: number;

  public constructor(left: number, right: number) {
    this.left = left;
    this.right = right;
  }

  public get width(): number {
    return this.right - this.left;
  }
}
