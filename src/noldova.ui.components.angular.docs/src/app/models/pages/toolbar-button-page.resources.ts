/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class ToolbarButtonPageResources {
  public static readonly title: string = "Toolbar button";
  public static readonly componentName: string = "ToolbarButtonComponent";
  public static readonly toolbarButtonToolbarTitle: string = "A toolbar with a toggle and a button that is unavailable";
  public static readonly toolbarButtonStatesTitle: string = "A button that opens a menu, and one that gets busy";
  public static readonly toolbarButtonOpenTitle: string = "Menu buttons pressed while their menus are open, with a label or icon-only";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus into the toolbar, onto its current button, and then past it: a toolbar is one Tab stop."),
    new DocsKey("Arrow Right", "In a toolbar, moves to the next button."),
    new DocsKey("Arrow Left", "In a toolbar, moves to the previous button."),
    new DocsKey("Home", "In a toolbar, moves to the first button."),
    new DocsKey("End", "In a toolbar, moves to the last button."),
    new DocsKey("Enter", "Presses the button; a busy button ignores it."),
    new DocsKey("Space", "Presses the button; a busy button ignores it.")
  ];
  public static readonly roles: readonly string[] = [
    "The button is a native button named by its label, set as aria-label; its glyph and chevron are hidden from assistive technology.",
    "A toggle reports aria-pressed, and a button that opens a menu is marked aria-haspopup=\"menu\".",
    "An unavailable button is marked aria-disabled: it stays focusable and still takes clicks, which its owner ignores.",
    "A busy button is marked aria-busy and ignores clicks, Enter and Space until it is no longer busy.",
    "Its toolbar has the toolbar role, named by nolToolbarLabel, and moves the focus between its buttons with the arrow keys."
  ];
}
