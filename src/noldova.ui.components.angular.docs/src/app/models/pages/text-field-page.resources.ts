/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class TextFieldPageResources {
  public static readonly title: string = "Text field";
  public static readonly componentName: string = "TextFieldComponent";
  public static readonly textFieldLinesTitle: string = "One line and several, each with its label";
  public static readonly textFieldInvalidTitle: string = "Disabled, and invalid with its message";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus into the field, or past it; a disabled field is skipped. In the field, the browser's own editing keys apply.")
  ];
  public static readonly roles: readonly string[] = [
    "The kit styles the native input or textarea, so it keeps the textbox role, its value, its disabled state and the browser's own editing keys.",
    "Its owner names it, with a label element around it or aria-label; a placeholder is never its name.",
    "Its owner marks an invalid entry aria-invalid, which draws the error border, and names the field's message in aria-describedby."
  ];
}
