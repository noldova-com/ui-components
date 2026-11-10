/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class TextFieldBoxPageResources {
  public static readonly title: string = "Text field box";
  public static readonly componentName: string = "TextFieldBoxComponent";
  public static readonly textFieldBoxActionTitle: string = "A button inside the field";
  public static readonly textFieldBoxEndTitle: string = "Muted text at the field's end";
  public static readonly textFieldBoxIconTitle: string = "A glyph at the field's start";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus into the input, then to the button inside the field, which comes after it; the muted text at the end takes no focus.")
  ];
  public static readonly roles: readonly string[] = [
    "The box adds no role of its own: the input keeps its textbox role and the name its owner gives it, and a button inside keeps its button role and its own name.",
    "While the button inside has keyboard focus, the field shows its focus border.",
    "The muted text at the end, marked nolTextFieldEnd, takes an id that the input names in aria-describedby, so it is read as the field's description; a click on it reaches the input.",
    "A glyph at the start, named by icon, is decorative: it is hidden from assistive technology with aria-hidden and takes no pointer, so the input keeps the name its owner gives it."
  ];
}
