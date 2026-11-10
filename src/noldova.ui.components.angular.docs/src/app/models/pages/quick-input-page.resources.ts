/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class QuickInputPageResources {
  public static readonly title: string = "Quick input";
  public static readonly componentName: string = "QuickInputComponent";
  public static readonly quickInputSearchTitle: string = "Search that marks what matches";
  public static readonly quickInputGroupsTitle: string = "Results in sections, and a text while none match";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Arrow Down", "Makes the next result the active one."),
    new DocsKey("Arrow Up", "Makes the previous result the active one."),
    new DocsKey("Home", "Makes the first result the active one; with Shift, selects the query to its start instead."),
    new DocsKey("End", "Makes the last result the active one; with Shift, selects the query to its end instead."),
    new DocsKey("Page Down", "Moves the active result down by a page of results."),
    new DocsKey("Page Up", "Moves the active result up by a page of results."),
    new DocsKey("Enter", "Chooses the active result."),
    new DocsKey("Escape", "Hides the active result's tooltip, if one shows; else asks the owner to close the search."),
    new DocsKey("Tab", "Goes to the owner as tabKey, such as to move to the next filter; unless the owner keeps it, the focus moves on.")
  ];
  public static readonly roles: readonly string[] = [
    "The field has the combobox role over a listbox, both named by label; the active result is followed with aria-activedescendant while the focus stays in the field, and is marked aria-selected.",
    "Results with a section sit in an element with the group role, named by the section's heading, which also describes the group's first result.",
    "The number of results is announced as a status; an empty text is announced in its place, as an alert when isEmptyTextAlert is true, and the field then reports its list closed."
  ];
}
