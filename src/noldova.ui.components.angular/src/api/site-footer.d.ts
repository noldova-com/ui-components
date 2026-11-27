/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { InputSignal } from "@angular/core";

/**
 * A website's footer, `nol-site-footer`, the page's `contentinfo` landmark: the
 * Noldova wordmark, with a product's name after it, linking home, an optional
 * line under it, a column of links for each {@link SiteLinkGroup}, the
 * columns sharing the row after the wordmark, and under them a notice and
 * any content projected after it. It draws on
 * the panel color with no border, and takes its width from the block it is
 * in, such as the page's body. Its content keeps to the site's
 * content width, a wider one for a documentation site. When the footer is
 * narrower than 48rem, as on a phone, the groups fall into two columns under
 * the wordmark.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { SiteFooterComponent, SiteLink, SiteLinkGroup } from "@noldova/ui.components.angular/site";
 *
 * @Component({
 *   selector: "nol-page-footer",
 *   imports: [SiteFooterComponent],
 *   template: "<nol-site-footer wordmark=\"/noldova-wordmark.svg\" name=\"TeamRun\" line=\"Run a team of agents.\" [groups]=\"groups\" />"
 * })
 * export class PageFooterComponent {
 *   protected readonly groups: readonly SiteLinkGroup[] = [new SiteLinkGroup("Product", [new SiteLink("Download", "/download")])];
 * }
 * ```
 */
export declare class SiteFooterComponent {
  /**
   * The URL of the Noldova wordmark's file, drawn as a mask in the text
   * color, so the site's own copy is used and the package ships none. It is
   * drawn in the file's own proportions, at the wordmark height.
   */
  public readonly wordmark: InputSignal<string>;

  /**
   * The wordmark file's width over its height, from its viewBox, which
   * reserves the wordmark's width before the file loads so nothing after it
   * moves; the Noldova wordmark's, 1333.817 / 201.396, when not bound. A site
   * that passes its own file passes that file's ratio.
   */
  public readonly wordmarkRatio: InputSignal<number>;

  /**
   * The product's name, drawn after the wordmark, such as `TeamRun`, which
   * names the lockup's link `TeamRun home`; null, the default, draws the
   * wordmark alone, its link named `Noldova home`.
   */
  public readonly name: InputSignal<string | null>;

  /**
   * Where the wordmark links; `/` when not bound.
   */
  public readonly homeHref: InputSignal<string>;

  /**
   * The lockup link's accessible name, such as `TeamRun home`; null, the
   * default, names it from `name`, or `Noldova home` without one. A site that
   * draws its own wordmark passes no `name` and names the link here.
   */
  public readonly homeLabel: InputSignal<string | null>;

  /**
   * The wordmark's size, as in the header: `SiteWordmarkSize.Small`, the
   * default, or `SiteWordmarkSize.Large` for a product's own wordmark.
   */
  public readonly wordmarkSize: InputSignal<SiteWordmarkSize>;

  /**
   * A short line under the wordmark, such as what the product does, its
   * line breaks kept; null, the default, for none. The notice follows it,
   * 3.5rem lower.
   */
  public readonly line: InputSignal<string | null>;

  /**
   * The link groups, one titled column each, in this order; a group is a
   * navigation landmark named by its title.
   */
  public readonly groups: InputSignal<readonly SiteLinkGroup[]>;

  /**
   * The notice at the bottom, as plain text; null, the default, says
   * `© <year> Noldova` with `Noldova` linking to https://noldova.com at
   * the page's stage, as `SiteStageService.address` gives it.
   */
  public readonly notice: InputSignal<string | null>;

  /**
   * Whether the content keeps to the wider width of a documentation site;
   * false, the default, keeps to the site's content width.
   */
  public readonly wide: InputSignal<boolean>;
}

/**
 * A link of the site's header, `SiteHeaderComponent`, or of a `SiteLinkGroup`.
 */
export declare class SiteLink {
  /**
   * The text the link shows.
   */
  public readonly label: string;

  /**
   * Where the link leads.
   */
  public readonly href: string;

  /**
   * Whether the link leads to the current page, which marks it
   * `aria-current="page"`; false, the default.
   */
  public readonly isCurrent: boolean;

  /**
   * The address of an SVG drawn before the label in the link's color, such as
   * a brand's mark on a footer link to it; null, the default, for none. The
   * header's links draw no icon.
   */
  public readonly icon: string | null;

  /**
   * Creates the link.
   *
   * @param label The text it shows.
   * @param href Where it leads.
   * @param isCurrent Whether it leads to the current page; false when left out.
   * @param icon The address of an SVG drawn before the label; none when left out.
   */
  public constructor(label: string, href: string, isCurrent?: boolean, icon?: string | null);
}

/**
 * A titled column of links in the site entry's footer, `SiteFooterComponent`.
 */
export declare class SiteLinkGroup {
  /**
   * The column's title, which also names its navigation landmark.
   */
  public readonly title: string;

  /**
   * The column's links, in this order.
   */
  public readonly links: readonly SiteLink[];

  /**
   * Creates the group.
   *
   * @param title The column's title.
   * @param links Its links, in order.
   */
  public constructor(title: string, links: readonly SiteLink[]);
}

/**
 * The size of the wordmark of the site entry's header and footer, `SiteHeaderComponent` and `SiteFooterComponent`.
 */
export declare enum SiteWordmarkSize {
  /**
   * The wordmark height, `--nol-site-wordmark`, 0.8125rem, for the Noldova
   * wordmark beside a product's name; the default.
   */
  Small = "Small",

  /**
   * A product's own wordmark, as high as TeamRun's header draws its
   * wordmark: 9.125rem wide in its proportions, 8.25rem in a header at most
   * 47.5rem wide and 7rem in one at most 22.5rem wide.
   */
  Large = "Large"
}
