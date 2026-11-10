/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MenuResources {
  public static readonly mouseenterEvent: "mouseenter" = "mouseenter";
  public static readonly hoverSelector: string = ":hover";
  public static formatMenuMinWidth(rem: number): string {
    return `min(${rem}rem, calc(100cqw - var(--nol-space-4)))`;
  }
}
