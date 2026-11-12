/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class MenuItemPageResources {
  public static readonly title: string = "Menu item";
  public static readonly componentName: string = "MenuItemComponent";
  public static readonly menuItemRowsTitle: string = "Rows with an icon, a key, a tag, a description, and one that destroys something";
  public static readonly menuItemChecksTitle: string = "Checkable rows, and rows that open a submenu, one showing its value without the chevron";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Enter", "Runs the row and closes the whole menu; a checkable row asks its owner to change its checked state."),
    new DocsKey("Space", "Runs the row as Enter does."),
    new DocsKey("Arrow Right", "On a row that opens a submenu, opens it with its first checked row, or else its first row, focused."),
    new DocsKey("Arrow Left", "In a submenu, closes it and gives the focus back to its row."),
    new DocsKey("Escape", "Hides the tooltip of a row whose text is cut, if one shows; else closes a submenu back to its row, or the menu back to its trigger.")
  ];
  public static readonly roles: readonly string[] = [
    "A row is a native button with the menuitem role; its label, description, value and tag are read together as its name, and its icon is hidden from assistive technology.",
    "A row whose checked is true or false has the menuitemcheckbox role when checkbox is true, and the menuitemradio role otherwise, and reports aria-checked; its check mark is hidden from assistive technology.",
    "A row that opens a submenu is marked aria-haspopup=\"menu\" and reports aria-expanded; its chevron is hidden from assistive technology.",
    "A disabled row is marked aria-disabled: the arrow keys still reach it, and it runs nothing."
  ];
}
