/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class QuickInputResources {
  public static readonly quickInputIdPrefix: string = "nol-quick-input-";
  public static readonly quickInputOptionSeparator: string = "-option-";
  public static readonly quickInputHeadingSeparator: string = "-heading-";
  public static readonly quickInputFieldSelector: string = ".nol-quick-input-field";
  public static readonly quickInputOptionSelector: string = "[role=option]";
  public static readonly quickInputListSelector: string = ".nol-quick-input-list";
  public static formatResultCount(count: number): string {
    if (count === 0)
      return "No results";
    return count === 1 ? "1 result" : `${count} results`;
  }
}
