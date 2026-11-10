/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class RadioPageResources {
  public static readonly title: string = "Radio";
  public static readonly componentName: string = "RadioComponent";
  public static readonly radioGroupedTitle: string = "Radios in a group, one of them disabled";
  public static readonly radioAloneTitle: string = "A radio on its own, bound to its owner";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus into the group, onto its checked radio, or its first when none is checked, and then past the group."),
    new DocsKey("Arrow Down", "Moves the focus to the next radio in the group and picks it, wrapping at the end; Arrow Right does the same. A disabled radio takes the focus without being picked."),
    new DocsKey("Arrow Up", "Moves the focus to the previous radio in the group and picks it, wrapping at the start; Arrow Left does the same."),
    new DocsKey("Space", "Picks the focused radio; a disabled one refuses it.")
  ];
  public static readonly roles: readonly string[] = [
    "The kit styles the browser's own radio, inside a label that holds its text, so it has the radio role, reports whether it is checked, and is named by its text.",
    "In a radio group the radios share one name, so the browser gives the group one Tab stop and its arrow keys; a radio on its own takes its checked from its owner.",
    "A disabled radio is marked aria-disabled rather than natively disabled: it stays focusable and the arrow keys reach it, but a click, Space or an arrow key never picks it.",
    "The dot is drawn over the circle and hidden from assistive technology with aria-hidden."
  ];
}
