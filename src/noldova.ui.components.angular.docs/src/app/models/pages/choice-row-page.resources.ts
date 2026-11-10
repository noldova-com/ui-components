/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class ChoiceRowPageResources {
  public static readonly title: string = "Choice row";
  public static readonly componentName: string = "ChoiceRowComponent";
  public static readonly choiceRowRadiosTitle: string = "Radio rows in a radio group, one of them disabled";
  public static readonly choiceRowChecksTitle: string = "Checkbox rows under a label";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the row's radio or checkbox; radio rows in a group are one Tab stop."),
    new DocsKey("Arrow Down", "In a radio group, moves the focus to the next row and picks it; a disabled row takes the focus without being picked."),
    new DocsKey("Arrow Up", "In a radio group, moves the focus to the previous row and picks it."),
    new DocsKey("Space", "Picks the focused radio row, or checks or clears the focused checkbox row; a disabled row refuses it.")
  ];
  public static readonly roles: readonly string[] = [
    "A row is a radio or a checkbox whose label holds the row's label and description, so the whole row is its hit target and its text names it.",
    "Radio rows go in a radio group, which has the radiogroup role and gives the rows one Tab stop and the arrow keys; checkbox rows take their own checked, and their owner groups them under a label, with the group role and aria-labelledby.",
    "A disabled row's radio or checkbox is marked aria-disabled, so the row stays focusable and the arrow keys still reach it, and nothing changes when it is activated."
  ];
}
