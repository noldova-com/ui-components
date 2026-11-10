/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class SashPageResources {
  public static readonly title: string = "Sash";
  public static readonly componentName: string = "SashComponent";
  public static readonly sashSideTitle: string = "Panes side by side";
  public static readonly sashOutputTitle: string = "Stacked panes";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the sash, one Tab stop, which shows its in-use bar while it has the keyboard focus."),
    new DocsKey("Arrow Left", "On a vertical sash, reports a move of one step to the left, 8px unless its owner sets another step; the owner resizes the panes."),
    new DocsKey("Arrow Right", "On a vertical sash, reports a move of one step to the right."),
    new DocsKey("Arrow Up", "On a horizontal sash, reports a move of one step upward."),
    new DocsKey("Arrow Down", "On a horizontal sash, reports a move of one step downward.")
  ];
  public static readonly roles: readonly string[] = [
    "It is a focusable separator named by its label, which names the pane it resizes, with its orientation: vertical between panes side by side, horizontal between stacked panes.",
    "The value, minimum and maximum its owner binds are the pane's size and limits in pixels, which assistive technology announces; the sash keeps to no limit itself, so its owner clamps the size.",
    "Its grip and its in-use bar are hidden from assistive technology."
  ];
}
