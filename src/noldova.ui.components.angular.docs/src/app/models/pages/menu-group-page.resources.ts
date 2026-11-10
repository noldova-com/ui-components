/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class MenuGroupPageResources {
  public static readonly title: string = "Menu group";
  public static readonly componentName: string = "MenuGroupComponent";
  public static readonly menuGroupChoicesTitle: string = "Groups of choices, opened on the checked one";
  public static readonly menuGroupScrollTitle: string = "A group that scrolls past four rows";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Arrow Down", "Moves to the next row, from a group's last row on to the first row after it, passing over the group's label."),
    new DocsKey("Arrow Up", "Moves to the previous row, passing over the group's label."),
    new DocsKey("Home", "Moves to the menu's first row; a group that scrolls brings it into view."),
    new DocsKey("End", "Moves to the menu's last row; a group that scrolls brings it into view."),
    new DocsKey("Escape", "Closes the menu and gives the focus back to its trigger.")
  ];
  public static readonly roles: readonly string[] = [
    "A group has the group role and is named by its label through aria-labelledby; the label is hidden from assistive technology, so it is read once, as the group's name, and takes no focus.",
    "Its rows keep their own roles: a radio row stays a menuitemradio, with its own aria-checked, inside the group.",
    "A menu that opens from its trigger takes the focus on its first checked row, so a group of choices opens on the one chosen."
  ];
}
