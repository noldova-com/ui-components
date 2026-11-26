/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { InputSignal } from "@angular/core";

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
