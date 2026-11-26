/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { InputSignal } from "@angular/core";
import type { ButtonVariant, IconName } from "@noldova/ui.components.angular";

/**
 * A call to action of a site hero, `SiteHeroComponent`, or a site
 * closing, `SiteClosingComponent`: a button link with its
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
