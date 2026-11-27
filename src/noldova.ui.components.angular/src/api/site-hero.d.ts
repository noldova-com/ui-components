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
 * The shot of a product a {@link SiteHeroComponent} or a
 * {@link SiteSectionComponent} shows: a file for each theme, each with an
 * optional one at twice the size for sharper screens, the files' size and
 * their text alternative.
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
