/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class RadioGroupPageResources {
  public static readonly title: string = "Radio group";
  public static readonly componentName: string = "RadioGroupComponent";
  public static readonly radioGroupValueTitle: string = "A two-way value";
  public static readonly radioGroupEmptyTitle: string = "Nothing chosen yet";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus into the group, onto its checked radio, or its first when none is checked, and then past the group."),
    new DocsKey("Arrow Down", "Moves the focus to the next radio in the group and picks it, wrapping at the end; Arrow Right does the same. A disabled radio takes the focus without being picked."),
    new DocsKey("Arrow Up", "Moves the focus to the previous radio in the group and picks it, wrapping at the start; Arrow Left does the same."),
    new DocsKey("Space", "Picks the focused radio; a disabled one refuses it.")
  ];
  public static readonly roles: readonly string[] = [
    "The group has the radiogroup role and is named by its label, set as aria-label.",
    "It gives its radios one shared name, so its checked radio, or its first when none is checked, is the group's one Tab stop, and the arrow keys move the choice and the focus together.",
    "While a radio in it has the focus, that radio is the group's Tab stop, so Tab leaves the group even from a disabled radio the arrow keys reached."
  ];
}
