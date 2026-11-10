/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class VirtualListCacheResources {
  public static readonly virtualListPageSize: number = 50;
  public static readonly virtualListCapacity: number = 150;
  public static readonly virtualListReadLimit: number = 1000;
  public static formatVirtualListReadMismatch(start: number, end: number, count: number): string {
    return `A read of the ${end - start} items from ${start} to ${end - 1} answered ${count}.`;
  }
}
