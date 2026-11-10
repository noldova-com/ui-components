/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class ShellRunResources {
  public static readonly shellRunLanguageParameter: string = "language";
  public static readonly shellRunBlockParameter: string = "block";
  public static formatShellRunBlockOutOfRange(block: number): string {
    return `The block must be a whole number from 0, its index among its message's code blocks; ${String(block)} is not.`;
  }
}
