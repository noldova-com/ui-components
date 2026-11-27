/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IconName } from "../../models/icon-name.js";

export class SiteHeaderResources {
  public static readonly menuIdPrefix: string = "nol-site-header-menu-";
  public static readonly searchIdPrefix: string = "nol-site-header-search-";
  public static readonly searchLabel: string = "Search";
  public static readonly searchGlyph: IconName = "search";
  public static readonly navLabel: string = "Site";
  public static readonly menuLabel: string = "Menu";
  public static readonly menuGlyph: IconName = "menu";
  public static readonly menuStops: string = "a[href], button";
  public static readonly closeGlyph: IconName = "close";
  public static readonly downloadLabel: string = "Download";
  public static readonly downloadGlyph: IconName = "download";
  public static readonly skipLabel: string = "Skip to content";
  public static readonly currentPage: string = "page";
  public static readonly compactClass: string = "nol-site-header-compact";
  public static readonly measuredClass: string = "nol-site-header-measured";
  public static readonly lockupName: string = ".nol-site-lockup-name";
  public static readonly lockupWordmark: string = ".nol-site-wordmark";
  public static readonly fontsLoadedEvent: string = "loadingdone";
  public static readonly fitSlack: number = 0.5;

  public static formatTarget(id: string): string {
    return `#${id}`;
  }
}
