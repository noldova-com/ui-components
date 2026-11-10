/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class MenuBarPageResources {
  public static readonly title: string = "Menu bar";
  public static readonly componentName: string = "MenuBarComponent";
  public static readonly menuBarAppTitle: string = "An application's menus";
  public static readonly menuBarRtlTitle: string = "In a right-to-left region";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus into the bar and then past it: the bar is one Tab stop."),
    new DocsKey("Arrow Right", "Moves to the next item; in an open menu, on a row that opens no submenu, opens the next item's menu. In a right-to-left region, Arrow Left does this."),
    new DocsKey("Arrow Left", "Moves to the previous item; in an open menu that is no submenu, opens the previous item's menu. In a right-to-left region, Arrow Right does this."),
    new DocsKey("Arrow Down", "Opens the item's menu with its first checked row, or else its first row, focused."),
    new DocsKey("Escape", "Closes the open menu and gives the focus back to its item.")
  ];
  public static readonly roles: readonly string[] = [
    "The bar has the menubar role and the horizontal aria-orientation, and is named by its label, set as aria-label.",
    "Each item has the menuitem role, is marked aria-haspopup=\"menu\" and reports aria-expanded; the menus it opens have the menu role.",
    "Left and Right follow the writing direction of the bar's own region, so a bar in a dir=\"rtl\" region of a left-to-right page swaps them, in the bar and in its open menus."
  ];
}
