/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { InputSignal } from "@angular/core";
import type { IconName } from "@noldova/ui.components.angular";

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
