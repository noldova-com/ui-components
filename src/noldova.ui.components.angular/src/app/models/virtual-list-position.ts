/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class VirtualListPosition {
  public readonly index: number;
  public readonly key: string | null;
  public readonly distance: number;
  public readonly isFollowing: boolean;

  public constructor(index: number, key: string | null, distance: number, isFollowing: boolean = false) {
    this.index = index;
    this.key = key;
    this.distance = distance;
    this.isFollowing = isFollowing;
  }
}
