/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class MenuBarItemPageResources {
  public static readonly title: string = "Menu bar item";
  public static readonly componentName: string = "MenuBarItemComponent";
  public static readonly menuBarItemChoicesTitle: string = "Items whose menus hold choices";
  public static readonly menuBarItemSubmenuTitle: string = "An item whose menu opens a submenu";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Enter", "Opens the item's menu with its first checked row, or else its first row, focused, or closes it."),
    new DocsKey("Space", "Opens or closes the item's menu as Enter does."),
    new DocsKey("Arrow Down", "Opens the item's menu with its first checked row, or else its first row, focused."),
    new DocsKey("Arrow Up", "Opens the item's menu with its first checked row, or else its last row, focused."),
    new DocsKey("A letter", "In the bar, moves to the next item whose label starts with what was typed."),
    new DocsKey("Escape", "Closes the item's menu and gives the focus back to the item.")
  ];
  public static readonly roles: readonly string[] = [
    "Each item is a native button with the menuitem role, named by its label; type-ahead in the bar matches the label.",
    "It is marked aria-haspopup=\"menu\" and reports aria-expanded while its menu is open.",
    "A disabled item is marked aria-disabled and stays focusable, so the arrow keys still reach it."
  ];
}
