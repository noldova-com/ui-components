/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { InputSignal, ModelSignal } from "@angular/core";
import type { ButtonVariant, IconName } from "@noldova/ui.components.angular";

/**
 * A call to action of a {@link SiteHeroComponent} or a
 * {@link SiteClosingComponent}: a button link with its
 * label and an optional Material Symbols icon after it.
 */
export declare class SiteAction {
  /**
   * The text the button shows.
   */
  public readonly label: string;

  /**
   * Where the button leads.
   */
  public readonly href: string;

  /**
   * The Material Symbols name of the icon drawn after the label, such as
   * `download`; null for none.
   */
  public readonly icon: IconName | null;

  /**
   * The button's look: `ButtonVariant.Primary` for the main action,
   * `ButtonVariant.Secondary` for the others.
   */
  public readonly variant: ButtonVariant;

  /**
   * Creates the action.
   *
   * @param label The text it shows.
   * @param href Where it leads.
   * @param icon The icon after the label; none when left out.
   * @param variant The button's look; `ButtonVariant.Primary` when left out.
   */
  public constructor(label: string, href: string, icon?: IconName | null, variant?: ButtonVariant);
}

/**
 * A card of a {@link SiteCardGridComponent}, `nol-site-card`, an `article`:
 * an optional row with a Material Symbols icon in the accent color and an
 * index such as `01` in the monospace font, a title, a muted paragraph and
 * any content projected after it, such as a small picture of the feature.
 * It draws on the panel color with a border and the site parts' radius.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { SiteCardComponent, SiteCardGridComponent } from "@noldova/ui.components.angular/site";
 *
 * @Component({
 *   selector: "nol-features",
 *   imports: [SiteCardComponent, SiteCardGridComponent],
 *   template: "<nol-site-card-grid><nol-site-card icon=\"forum\" index=\"01\" title=\"One chat, every agent.\" text=\"Each agent reads the same chat.\" /></nol-site-card-grid>"
 * })
 * export class FeaturesComponent {}
 * ```
 */
export declare class SiteCardComponent {
  /**
   * The Material Symbols name of the icon at the card's top left; null, the
   * default, for none.
   */
  public readonly icon: InputSignal<IconName | null>;

  /**
   * The short mark at the card's top right, such as `01`; null, the default,
   * for none. With neither an icon nor an index, the card starts with its
   * title.
   */
  public readonly index: InputSignal<string | null>;

  /**
   * The card's title, a level-3 heading; a line break in it starts a new line.
   */
  public readonly title: InputSignal<string>;

  /**
   * The paragraph under the title, in the muted color; null, the default, for
   * the content projected with the `nolSiteCardText` attribute, which then
   * takes the paragraph's place and style, such as a line holding markup of
   * its own. With neither, the card has no paragraph.
   */
  public readonly text: InputSignal<string | null>;
}

/**
 * A grid of {@link SiteCardComponent}s, `nol-site-card-grid`: as many
 * columns of at least 18rem as fit share each row, one column when the grid
 * is narrower.
 */
export declare class SiteCardGridComponent {
  /**
   * The columns on a wide screen, 75rem and wider, such as 4 for seven cards
   * set four and three; two columns on a tablet and one on a phone, below
   * 47.5rem, and the last card spans what its row leaves. Null, the default,
   * for as many 18rem columns as fit.
   */
  public readonly columns: InputSignal<number | null>;
}

/**
 * The closing call to action of a website's page, `nol-site-closing`: an
 * optional mark in a raised frame, an optional line in the monospace font and
 * the accent color, the level-2 title, an optional button and an optional text
 * link in the accent color, and the note under them, all centred. The note is
 * the content projected into it, such as a line and a wordmark; with none, it
 * takes no room. It keeps to the site's content width; below 47.5em its space
 * above and below narrows. It needs the site parts' styles, `styles/site.css`.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { SiteAction, SiteClosingComponent } from "@noldova/ui.components.angular/site";
 *
 * @Component({
 *   selector: "nol-home-closing",
 *   imports: [SiteClosingComponent],
 *   template: "<nol-site-closing title=\"Ready when you are.\" headingId=\"closing-title\" [action]=\"download\">Free and open source.</nol-site-closing>"
 * })
 * export class HomeClosingComponent {
 *   protected readonly download: SiteAction = new SiteAction("Download", "/download/", "download");
 * }
 * ```
 */
export declare class SiteClosingComponent {
  /**
   * The file of the product's mark, drawn 2.3125rem square in a raised frame
   * over the rest; null, the default, for none. It is decorative, so it has no
   * text alternative.
   */
  public readonly mark: InputSignal<string | null>;

  /**
   * The mark to draw in dark mode in place of `mark`, such as a light glyph for
   * a dark one; `mark` in both modes when not bound.
   */
  public readonly markDark: InputSignal<string | null>;

  /**
   * The line above the title, drawn in capitals; null, the default, for
   * none.
   */
  public readonly eyebrow: InputSignal<string | null>;

  /**
   * The title, where each line break starts a new line; null, the default,
   * for the content projected with the `nolSiteClosingTitle` attribute, which
   * then fills the heading in its style, such as a title holding markup of its
   * own.
   */
  public readonly title: InputSignal<string | null>;

  /**
   * The title's id, which names the closing region.
   */
  public readonly headingId: InputSignal<string>;

  /**
   * The button under the title; null, the default, for none.
   */
  public readonly action: InputSignal<SiteAction | null>;

  /**
   * The text link beside the button, in the accent color, with its icon after
   * the label; null, the default, for none. Its variant is not used.
   */
  public readonly link: InputSignal<SiteAction | null>;
}

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
   * `© <year> Noldova` with `Noldova` linking to https://noldova.com.
   */
  public readonly notice: InputSignal<string | null>;

  /**
   * Whether the content keeps to the wider width of a documentation site;
   * false, the default, keeps to the site's content width.
   */
  public readonly wide: InputSignal<boolean>;
}

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
 *   template: "<nol-site-header wordmark=\"/noldova-wordmark.svg\" name=\"TeamRun\" contentId=\"main\" [links]=\"links\" [social]=\"social\" downloadHref=\"/download\" />"
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
   * The lockup link's accessible name, such as `UI Components docs home`;
   * null, the default, names it from `name`, as `TeamRun home`, or
   * `Noldova home` without one. A site whose wordmark or icon already shows
   * the product's name passes no `name`, so the name isn't drawn twice, and
   * names the link here.
   */
  public readonly homeLabel: InputSignal<string | null>;

  /**
   * The wordmark's size: `SiteWordmarkSize.Small`, the default, for the
   * Noldova wordmark, or `SiteWordmarkSize.Large` for a product's own
   * wordmark, such as TeamRun's.
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
 * A website's hero, `nol-site-hero`, the top of its home page: an optional
 * line in the monospace font and the accent color, the page's level-1
 * headline, its second line in the accent color, the side text beside it,
 * the calls to action under them and, under all of them, an optional shot of
 * the product, framed, in the theme the page shows. The side text is the
 * content projected into it, with an optional closing line under it in the
 * text color. It keeps to the site's content width. Below 68.75em the side
 * text narrows and below 47.5em it goes under the headline, without its
 * closing line; below 26.25em the actions stand one under another. It needs
 * the site parts' styles, `styles/site.css`.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { SiteAction, SiteHeroComponent } from "@noldova/ui.components.angular/site";
 *
 * @Component({
 *   selector: "nol-home-hero",
 *   imports: [SiteHeroComponent],
 *   template: "<nol-site-hero eyebrow=\"Your agents. One team.\" title=\"Your AI agents,\" accent=\"working as one team.\" [actions]=\"actions\">Put your agents in the same chat.</nol-site-hero>"
 * })
 * export class HomeHeroComponent {
 *   protected readonly actions: readonly SiteAction[] = [new SiteAction("Download", "/download/", "download")];
 * }
 * ```
 */
export declare class SiteHeroComponent {
  /**
   * The line above the headline, drawn in capitals; null, the default, for
   * none.
   */
  public readonly eyebrow: InputSignal<string | null>;

  /**
   * The headline's first line.
   */
  public readonly title: InputSignal<string>;

  /**
   * The headline's second line, in the accent color; null, the default, for
   * none.
   */
  public readonly accent: InputSignal<string | null>;

  /**
   * The words under the side text, in the text color, where each line break
   * starts a new line; null, the default, for none. A phone leaves them out.
   */
  public readonly closing: InputSignal<string | null>;

  /**
   * The headline's id, which names the hero's region;
   * `nol-site-hero-title` when not bound.
   */
  public readonly titleId: InputSignal<string>;

  /**
   * The calls to action under the headline, in order; none by default.
   */
  public readonly actions: InputSignal<readonly SiteAction[]>;

  /**
   * The shot of the product under the hero; null, the default, for none.
   */
  public readonly shot: InputSignal<SiteShot | null>;

  /**
   * The shot's id, so that a link such as `/#product` leads to it; null, the
   * default, for none.
   */
  public readonly shotId: InputSignal<string | null>;
}

/**
 * A link of the site entry's header, `SiteHeaderComponent`, or of a {@link SiteLinkGroup}.
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
 * A section of a website's page, `nol-site-section`: an optional line in the
 * monospace font and the accent color over its level-2 title, with an
 * optional muted line beside the title, at its foot, and the section's
 * content projected under them. It keeps to the site's content width, with
 * the site parts' space above and below. Below 47.5em the copy goes under
 * the title and its lines run together. It needs the site parts' styles,
 * `styles/site.css`.
 *
 * @example
 * ```ts
 * import { Component } from "@angular/core";
 * import { SiteSectionComponent } from "@noldova/ui.components.angular/site";
 *
 * @Component({
 *   selector: "nol-workflow",
 *   imports: [SiteSectionComponent],
 *   template: "<nol-site-section eyebrow=\"One team. Your rules.\" title=\"Agents that work together.\" headingId=\"workflow-title\">...</nol-site-section>"
 * })
 * export class WorkflowComponent {}
 * ```
 */
export declare class SiteSectionComponent {
  /**
   * The line above the title, drawn in capitals; null, the default, for
   * none.
   */
  public readonly eyebrow: InputSignal<string | null>;

  /**
   * The section's title; a line break in it starts a new line.
   */
  public readonly title: InputSignal<string>;

  /**
   * The muted line beside the title. Each line break in it starts a new line
   * beside the title, and becomes a space below 47.5em. Null, the default, for
   * the content projected with the `nolSiteSectionCopy` attribute, which then
   * takes the copy's place and style, such as a line holding markup of its
   * own; each of its elements with the `nol-site-section-copy-line` class is
   * one of those lines. With neither, the section has no copy.
   */
  public readonly copy: InputSignal<string | null>;

  /**
   * The title's id, which names the section's region.
   */
  public readonly headingId: InputSignal<string>;

  /**
   * The section's id, so that a link can lead to it; null, the default, for
   * none.
   */
  public readonly sectionId: InputSignal<string | null>;
}

/**
 * The shot of a product a {@link SiteHeroComponent} shows: a file for each
 * theme, each with an optional one at twice the size for sharper screens,
 * the files' size and their text alternative.
 */
export declare class SiteShot {
  /**
   * The light theme's file.
   */
  public readonly light: string;

  /**
   * The light theme's file at twice the size; null for none.
   */
  public readonly lightLarge: string | null;

  /**
   * The dark theme's file.
   */
  public readonly dark: string;

  /**
   * The dark theme's file at twice the size; null for none.
   */
  public readonly darkLarge: string | null;

  /**
   * The files' width in pixels, which, with their height, reserves the
   * shot's room before it loads.
   */
  public readonly width: number;

  /**
   * The files' height in pixels.
   */
  public readonly height: number;

  /**
   * What the shot shows, for those who can't see it.
   */
  public readonly alt: string;

  /**
   * Creates the shot.
   *
   * @param light The light theme's file.
   * @param dark The dark theme's file.
   * @param width The files' width in pixels.
   * @param height The files' height in pixels.
   * @param alt What the shot shows.
   * @param lightLarge The light file at twice the size; none when left out.
   * @param darkLarge The dark file at twice the size; none when left out.
   */
  public constructor(light: string, dark: string, width: number, height: number, alt: string, lightLarge?: string | null, darkLarge?: string | null);
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
   * A product's own wordmark, as high as TeamRun's header draws its
   * wordmark: 9.125rem wide in its proportions, 8.25rem in a header at most
   * 47.5rem wide and 7rem in one at most 22.5rem wide.
   */
  Large = "Large"
}
