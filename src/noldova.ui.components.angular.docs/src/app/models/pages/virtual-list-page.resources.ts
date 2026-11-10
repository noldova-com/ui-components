/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class VirtualListPageResources {
  public static readonly title: string = "Virtual list";
  public static readonly componentName: string = "VirtualListComponent";
  public static readonly virtualListNotesTitle: string = "A thousand options to choose from";
  public static readonly virtualListWrappedTitle: string = "Rows of different heights";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus into the list, its one Tab stop: to the row focused last, or the selected row, or the first."),
    new DocsKey("Arrow Down", "Moves to the next row."),
    new DocsKey("Arrow Up", "Moves to the previous row."),
    new DocsKey("Page Down", "Moves down by the list's height."),
    new DocsKey("Page Up", "Moves up by the list's height."),
    new DocsKey("Home", "Moves to the first row."),
    new DocsKey("End", "Moves to the last row."),
    new DocsKey("Enter", "Chooses the focused row, which its owner selects."),
    new DocsKey("Space", "Chooses the focused row, as Enter does.")
  ];
  public static readonly roles: readonly string[] = [
    "An options list is a listbox named by its label, busy while rows load; each row is an option marked selected or not, with its position and the size of the whole list, so a row far down is read as, for example, 500 of 1000.",
    "Only the rows near the view are in the page, so each row's position, not the rows in the page, tells assistive technology where it stands.",
    "A read that fails shows \"These items couldn't load.\" in a field message, with a Retry button beside it."
  ];
}
