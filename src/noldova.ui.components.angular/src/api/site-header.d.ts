/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { InputSignal, ModelSignal } from "@angular/core";

/**
 * A website's header, `nol-site-header`, the page's `banner` landmark, which
 * stays at the top as the page scrolls: the Noldova wordmark, with a
 * product's name after it, linking home, an optional version, the site's
 * links, a search field projected with {@link SiteSearchDirective}, social
 * links, the theme switch and an optional Download button. It has no border.
 * It takes its width from the block it is in, such as the page's body, and
 * lays itself out by that width, never by its content's.
 *
 * The theme switch offers Light, Dark and System, saves the choice in
 * `localStorage` under `noldova-theme` as `light`, `dark` or `system`, and
 * sets `data-nol-theme-mode` on the root element, or removes it for System;
 * with nothing saved it follows the system. It applies the saved choice
 * once it renders. The package ships no head script: each site sets
 * `data-nol-theme-mode` from `noldova-theme` the same way in a script in its
 * own head, which runs before the page renders, so the page never flashes
 * the other theme. Prerendered, the switch checks no choice, since it can't
 * read the saved one, and until the page hydrates it draws as chosen the
 * one `data-nol-theme-mode` names, or System when it names none.
 *
 * When the header is narrower than 48rem, as on a phone, the bar keeps the
 * wordmark, Download, a search button when the site projects a search, and
 * a menu button. The search button opens the search below the bar, focused
 * on its field; the menu button opens the links, social links and theme
 * switch below it, with Download among them on a wide site. Opening one
 * closes the other, and Escape closes either and returns the focus to its
 * button; a tap outside the search closes it and leaves the focus where the
 * tap put it. Opening the menu moves the focus to its first link, and Tab
 * follows the parts in the order they are drawn at either width.
 *
 * Once the page scrolls under it, the header turns translucent, its panel
 * color 92% opaque over a blur of what is behind it, and opaque again back
 * at the top. It stays opaque with its menu or search open, when the
 * visitor asks for reduced transparency, and where the browser can't blur.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { SiteHeaderComponent, SiteLink, SiteSocialLink } from "@noldova/ui.components.angular/site";
 *
 * @Component({
 *   selector: "nol-page-header",
 *   imports: [SiteHeaderComponent],
 *   template: "<nol-site-header wordmark=\"/noldova-wordmark.svg\" name=\"Example\" contentId=\"main\" [links]=\"links\" [social]=\"social\" downloadHref=\"/download\" />"
 * })
 * export class PageHeaderComponent {
 *   protected readonly links: readonly SiteLink[] = [new SiteLink("Features", "/features", true), new SiteLink("Docs", "/docs")];
 *   protected readonly social: readonly SiteSocialLink[] = [new SiteSocialLink("GitHub", "https://github.com/noldova-com", "/github.svg")];
 * }
 * ```
 */
export declare class SiteHeaderComponent {
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
   * The product's name, drawn after the wordmark, such as `Example`, which
   * names the lockup's link `Example home`; null, the default, draws the
   * wordmark alone, its link named `Noldova home`.
   */
  public readonly name: InputSignal<string | null>;

  /**
   * Where the wordmark links; `/` when not bound.
   */
  public readonly homeHref: InputSignal<string>;

  /**
   * The lockup link's accessible name, such as `UI Components docs home`;
   * null, the default, names it from `name`, as `Example home`, or
   * `Noldova home` without one. A site whose wordmark or icon already shows
   * the product's name passes no `name`, so the name isn't drawn twice, and
   * names the link here.
   */
  public readonly homeLabel: InputSignal<string | null>;

  /**
   * The wordmark's size: `SiteWordmarkSize.Small`, the default, for the
   * Noldova wordmark, or `SiteWordmarkSize.Large` for a product's own
   * wordmark.
   */
  public readonly wordmarkSize: InputSignal<SiteWordmarkSize>;

  /**
   * The product's icon, drawn in its own colors before the wordmark, 1.75rem square (`--nol-site-icon`) and 0.75rem from it; none when not bound. The image is decorative, so the link's name stays the product's home.
   */
  public readonly icon: InputSignal<string | null>;

  /**
   * The icon to draw in dark mode in place of `icon`; `icon` in both modes when not bound.
   */
  public readonly iconDark: InputSignal<string | null>;

  /**
   * A version drawn after the wordmark in small muted text, such as
   * `v0.0.9`; null, the default, for none.
   */
  public readonly version: InputSignal<string | null>;

  /**
   * Where the version links, such as its release notes; null, the default,
   * draws it as plain text.
   */
  public readonly versionHref: InputSignal<string | null>;

  /**
   * The site's links, in this order; the current page's link is marked
   * `aria-current="page"` and drawn strong.
   */
  public readonly links: InputSignal<readonly SiteLink[]>;

  /**
   * The social links, each an icon button with its label as accessible name
   * and tooltip.
   */
  public readonly social: InputSignal<readonly SiteSocialLink[]>;

  /**
   * Where the Download button links; null, the default, draws no button.
   */
  public readonly downloadHref: InputSignal<string | null>;

  /**
   * The Download button's text; `Download` when not bound.
   */
  public readonly downloadLabel: InputSignal<string>;

  /**
   * Whether the bar keeps to the wider width of a documentation site, whose
   * phone menu holds the Download button; false, the default, keeps to the
   * site's content width.
   */
  public readonly wide: InputSignal<boolean>;

  /**
   * The id of the page's main content, which a skip link, shown when it has
   * the focus, leads to; null, the default, draws no skip link.
   */
  public readonly contentId: InputSignal<string | null>;

  /**
   * Whether the phone menu is open; false, the default. The menu button,
   * Escape and following a link in the menu change it, and a site sets it
   * false to close the menu, such as when its router moves to another page.
   * It has no effect while the header is at least 48rem wide, where it shows
   * no menu.
   */
  public readonly menuOpen: ModelSignal<boolean>;

  /**
   * Whether the phone search is open under the bar; false, the default. The
   * search button and Escape change it, and so does a tap outside a search
   * the search button opened; a search the site opens stays open until the
   * button or Escape closes it. Opening the menu closes it. It has no effect
   * while the header is at least 48rem wide, where the search shows in the
   * bar.
   */
  public readonly searchOpen: ModelSignal<boolean>;

  /**
   * Creates the header, which reads the page's scroll once it renders and on
   * each scroll of the window after. Angular creates it from its selector.
   */
  public constructor();
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
 * Marks the search field projected into a {@link SiteHeaderComponent}, which
 * draws it before the social links, or under the bar while the phone search
 * is open, focusing it as the search opens.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { SiteHeaderComponent, SiteSearchDirective } from "@noldova/ui.components.angular/site";
 *
 * @Component({
 *   selector: "nol-docs-header",
 *   imports: [SiteHeaderComponent, SiteSearchDirective],
 *   template: "<nol-site-header wordmark=\"/noldova-wordmark.svg\" [wide]=\"true\"><input nolSiteSearch type=\"search\" aria-label=\"Search\" /></nol-site-header>"
 * })
 * export class DocsHeaderComponent {
 * }
 * ```
 */
export declare class SiteSearchDirective {
  /**
   * Moves the focus to the marked field.
   */
  public focus(): void;
}

/**
 * A social link of the site entry's header, `SiteHeaderComponent`, drawn as an icon button.
 */
export declare class SiteSocialLink {
  /**
   * The link's accessible name and tooltip, such as `GitHub`.
   */
  public readonly label: string;

  /**
   * Where the link leads.
   */
  public readonly href: string;

  /**
   * The URL of the icon's file, drawn as a mask in the link's color, so the
   * site's own copy is used and the package ships no third-party logo.
   */
  public readonly icon: string;

  /**
   * Creates the social link.
   *
   * @param label Its accessible name and tooltip.
   * @param href Where it leads.
   * @param icon The URL of its icon's file.
   */
  public constructor(label: string, href: string, icon: string);
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
   * A product's own wordmark, as high as the site header draws one:
   * 9.125rem wide in its proportions, 8.25rem in a header at most
   * 47.5rem wide and 7rem in one at most 22.5rem wide.
   */
  Large = "Large"
}
