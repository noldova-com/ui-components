/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

export class SiteLockupResources {
  public static readonly homeHref: string = "/";
  public static readonly company: string = "Noldova";
  public static readonly wordmarkRatio: number = 1333.817 / 201.396;

  public static formatMask(url: string): string {
    return `url(${JSON.stringify(url)})`;
  }

  public static formatRatio(ratio: number): string {
    return `auto ${ratio}`;
  }

  public static formatName(name: string | null): string {
    return `${String.isNullOrWhitespace(name) ? SiteLockupResources.company : name} home`;
  }
}
