/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class SiteHeaderResources {
  public static readonly menuIdPrefix: string = "nol-site-header-menu-";
  public static readonly searchIdPrefix: string = "nol-site-header-search-";
  public static readonly searchLabel: string = "Search";
  public static readonly searchGlyph: string = "search";
  public static readonly navLabel: string = "Site";
  public static readonly menuLabel: string = "Menu";
  public static readonly menuGlyph: string = "menu";
  public static readonly menuStops: string = "a[href], button";
  public static readonly closeGlyph: string = "close";
  public static readonly downloadLabel: string = "Download";
  public static readonly downloadGlyph: string = "download";
  public static readonly skipLabel: string = "Skip to content";
  public static readonly currentPage: string = "page";

  public static formatTarget(id: string): string {
    return `#${id}`;
  }
}
