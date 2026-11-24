/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class SiteFooterResources {
  public static readonly owner: string = "Noldova";
  public static readonly currentPage: string = "page";

  public static formatNotice(year: number): string {
    return `© ${year} ${SiteFooterResources.owner}`;
  }
}
