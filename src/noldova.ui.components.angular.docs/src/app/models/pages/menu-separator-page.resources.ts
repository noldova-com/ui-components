/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class MenuSeparatorPageResources {
  public static readonly title: string = "Menu separator";
  public static readonly componentName: string = "MenuSeparatorComponent";
  public static readonly menuSeparatorSectionsTitle: string = "Sections of a tab's actions";
  public static readonly menuSeparatorGroupTitle: string = "Between a group and the row after it";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Arrow Down", "Passes over the separator to the next row: a separator takes no focus."),
    new DocsKey("Arrow Up", "Passes over the separator to the previous row.")
  ];
  public static readonly roles: readonly string[] = [
    "A separator has the separator role and no name, so a screen reader reads it as a break between the rows around it.",
    "It is no menu item: the arrow keys, Home, End and type-ahead never stop on it."
  ];
}
