/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class TreePageResources {
  public static readonly title: string = "Tree";
  public static readonly componentName: string = "TreeComponent";
  public static readonly treeFilesTitle: string = "Folders and files, one of them current";
  public static readonly treeMovableTitle: string = "Rows the person moves";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus into the tree, its one Tab stop: to the row focused last, or the current row, or the first."),
    new DocsKey("Arrow Down", "Moves to the next row."),
    new DocsKey("Arrow Up", "Moves to the previous row."),
    new DocsKey("Arrow Right", "Opens a closed branch, or moves into an open one."),
    new DocsKey("Arrow Left", "Closes an open branch, or moves to the row's parent."),
    new DocsKey("Home", "Moves to the first row."),
    new DocsKey("End", "Moves to the last row."),
    new DocsKey("A letter", "Moves to a row whose label starts with what is typed."),
    new DocsKey("Enter", "Chooses the row, and opens or closes a branch."),
    new DocsKey("Space", "Chooses the row, and opens or closes a branch."),
    new DocsKey("Alt+Arrow Up", "In a movable tree, moves the focused row before its previous sibling."),
    new DocsKey("Alt+Arrow Down", "In a movable tree, moves the focused row after its next sibling."),
    new DocsKey("Alt+Arrow Right", "In a movable tree, moves the focused row into the branch before it, as its last child, opening that branch; Left in a right-to-left layout."),
    new DocsKey("Alt+Arrow Left", "In a movable tree, moves the focused row out to just after its parent; Right in a right-to-left layout.")
  ];
  public static readonly roles: readonly string[] = [
    "It is a tree named by its label; each row is a tree item at its level, marked expanded or collapsed when it is a branch, and the current row is marked selected.",
    "A row is named by its label, which wraps when it is long; its twistie and its icon are hidden from assistive technology.",
    "A movable tree's rows name the Alt and arrow keys that move them as their keyboard shortcuts; its owner applies each move the tree reports, the focus stays on the moved row, and the move is announced politely, such as Moved Notes to position 2 of 3."
  ];
}
