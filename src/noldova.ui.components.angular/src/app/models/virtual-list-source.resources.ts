/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class VirtualListSourceResources {
  public static readonly virtualListEstimate: number = 120;
  public static formatVirtualListLengthInvalid(length: number): string {
    return `A list's length must be a whole number of 0 or more, not ${length}.`;
  }
  public static formatVirtualListEstimateInvalid(estimate: number): string {
    return `A row's estimated height must be a number of pixels above 0, not ${estimate}.`;
  }
  public static formatVirtualListInsertInvalid(at: number, count: number, length: number): string {
    return `${count} items can't be inserted at ${at} in a list of ${length}; the count must be a whole number of 1 or more and the place from 0 to the length.`;
  }
  public static formatVirtualListRangeInvalid(at: number, count: number, length: number): string {
    return `${count} items from ${at} are not in a list of ${length}; the count must be a whole number of 1 or more and every item inside the list.`;
  }
}
