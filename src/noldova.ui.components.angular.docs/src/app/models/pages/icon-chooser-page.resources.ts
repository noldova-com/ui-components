/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class IconChooserPageResources {
  public static readonly title: string = "Icon chooser";
  public static readonly componentName: string = "IconChooserComponent";
  public static readonly iconChooserBoundTitle: string = "One icon or none, bound to its owner";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Arrow keys", "Move the active cell by one cell, or by one row with Arrow Up and Arrow Down."),
    new DocsKey("Page Up, Page Down", "Move the active cell by the rows in view."),
    new DocsKey("Home, End", "Move the active cell to the start or end of its row; with Control, to the first or last cell."),
    new DocsKey("Enter, Space", "Choose the active cell."),
    new DocsKey("A letter", "Moves the focus from the grid to the search field and types the letter there."),
    new DocsKey("Arrow Down in the search field", "Moves the focus back to the grid.")
  ];
  public static readonly roles: readonly string[] = [
    "The search field is named \"Search icons\" and controls the grid through aria-controls.",
    "The grid is a listbox named by label; it keeps the focus and names its active cell through aria-activedescendant.",
    "Each cell is an option named by its icon's words, \"No icon\" for none, with aria-selected, and aria-setsize and aria-posinset for its place in the whole list.",
    "A status below the grid says how many icons are offered."
  ];
}
