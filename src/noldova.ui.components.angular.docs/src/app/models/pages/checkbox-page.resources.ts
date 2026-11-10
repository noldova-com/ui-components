/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class CheckboxPageResources {
  public static readonly title: string = "Checkbox";
  public static readonly componentName: string = "CheckboxComponent";
  public static readonly checkboxBoundTitle: string = "Checked and cleared, bound to its owner";
  public static readonly checkboxDisabledTitle: string = "Disabled, and still focusable";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the box, or past it; a disabled box stays in the Tab order."),
    new DocsKey("Space", "Checks or clears the box; a disabled box refuses it.")
  ];
  public static readonly roles: readonly string[] = [
    "The kit styles the browser's own checkbox, inside a label that holds its text, so the box has the checkbox role, reports whether it is checked, and is named by its text.",
    "A disabled box is marked aria-disabled rather than natively disabled, so it stays focusable, keeps the focus when it turns disabled, and refuses a click or Space.",
    "The check mark is drawn over the box and hidden from assistive technology with aria-hidden."
  ];
}
