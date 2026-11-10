/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class SplitButtonPageResources {
  public static readonly title: string = "Split button";
  public static readonly componentName: string = "SplitButtonComponent";
  public static readonly splitButtonMenuTitle: string = "A main action with a menu of choices for it";
  public static readonly splitButtonStatesTitle: string = "Unavailable, and busy";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the main action, then to the arrow: each half is a tab stop of its own."),
    new DocsKey("Enter", "On the main action, triggers it; on the arrow, opens the menu with its first choice focused, or closes it."),
    new DocsKey("Space", "On the main action, triggers it; on the arrow, opens the menu with its first choice focused, or closes it."),
    new DocsKey("Arrow Down", "On the arrow, opens the menu with its first choice focused; in the menu, moves to the next choice."),
    new DocsKey("Arrow Up", "On the arrow, opens the menu with its last choice focused; in the menu, moves to the previous choice."),
    new DocsKey("Escape", "Closes the menu and gives the focus back to the arrow.")
  ];
  public static readonly roles: readonly string[] = [
    "Each half is a native button with its own name, set as aria-label: the main action's is label, the arrow's is menuLabel.",
    "The arrow is marked aria-haspopup=\"menu\" and reports aria-expanded; the menu it opens has the menu role, and its choices the menuitem role.",
    "A disabled split button marks its main action aria-disabled, so it stays focusable and does nothing, while the arrow still opens the menu.",
    "A busy split button marks its main action aria-busy, and ignores clicks, Enter, Space and the arrow's up and down arrows until it is no longer busy."
  ];
}
