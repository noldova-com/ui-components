/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class SelectPageResources {
  public static readonly title: string = "Select";
  public static readonly componentName: string = "SelectComponent";
  public static readonly selectOptionsTitle: string = "Options, one with a tag";
  public static readonly selectGroupsTitle: string = "Groups, a disabled option, and a description";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the select's button, or past it; in the open list, closes it and gives the focus back to the button."),
    new DocsKey("Enter", "On the button, opens the list; in the list, picks the active option and closes the list."),
    new DocsKey("Space", "On the button, opens the list; in the list, picks the active option and closes the list."),
    new DocsKey("Arrow Down", "In the list, makes the next option that can be chosen the active one."),
    new DocsKey("Arrow Up", "In the list, makes the previous option that can be chosen the active one."),
    new DocsKey("Home", "In the list, makes the first option that can be chosen the active one."),
    new DocsKey("End", "In the list, makes the last option that can be chosen the active one."),
    new DocsKey("A letter", "In the list, makes the next option whose title starts with what was typed the active one."),
    new DocsKey("Escape", "Closes the list and gives the focus back to the button.")
  ];
  public static readonly roles: readonly string[] = [
    "The select is a native button marked aria-haspopup=\"listbox\" that reports aria-expanded; its name joins the label, the chosen option's title and its tag, so it is read with its value.",
    "The list it opens has the listbox role and is named by the label; each choice has the option role, the chosen one is marked aria-selected, and the active one is followed with aria-activedescendant while the focus stays on the list.",
    "Options given in a SelectGroup sit in an element with the group role, named by the group's label; a disabled option is marked aria-disabled, and the keys pass over it.",
    "describedBy names an element, such as a field message, in the button's aria-describedby."
  ];
}
