/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class MenuPageResources {
  public static readonly title: string = "Menu";
  public static readonly componentName: string = "MenuComponent";
  public static readonly menuActionsTitle: string = "A menu that opens from a button";
  public static readonly menuInlineTitle: string = "A menu kept on the page, with a minimum width";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Enter", "On the trigger, opens the menu with its first checked row, or else its first row, focused; on a row, runs it and closes the menu."),
    new DocsKey("Space", "On the trigger, opens the menu as Enter does; on a row, runs it and closes the menu."),
    new DocsKey("Arrow Down", "On the trigger, opens the menu as Enter does; in the menu, moves to the next row."),
    new DocsKey("Arrow Up", "On the trigger, opens the menu with its first checked row, or else its last row, focused; in the menu, moves to the previous row."),
    new DocsKey("Home", "Moves to the menu's first row."),
    new DocsKey("End", "Moves to the menu's last row."),
    new DocsKey("A letter", "Moves to the next row whose label starts with what was typed."),
    new DocsKey("Escape", "Closes the menu and gives the focus back to its trigger; an Escape that hid a row's tooltip first closes nothing."),
    new DocsKey("Tab", "Closes the menu and gives the focus back to its trigger.")
  ];
  public static readonly roles: readonly string[] = [
    "The menu has the menu role; name it with aria-label, as these examples do.",
    "Its trigger, the element that uses nolMenuTriggerFor, is marked aria-haspopup=\"menu\" and reports aria-expanded while the menu is open.",
    "Its rows have the menuitem role, or menuitemcheckbox or menuitemradio with aria-checked while they can be checked; a separator has the separator role and takes no focus.",
    "A menu kept on the page is one Tab stop, which gives the focus to its first row; the arrow keys then move between its rows as in a menu that opens."
  ];
}
