/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class ButtonPageResources {
  public static readonly title: string = "Button";
  public static readonly componentName: string = "ButtonComponent";
  public static readonly variantsTitle: string = "Variants and looks";
  public static readonly busyTitle: string = "Busy while its work runs";
  public static readonly linkTitle: string = "A link, and a compact button with an icon";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the button, or past it; a disabled button is skipped, and a busy one keeps its place."),
    new DocsKey("Enter", "Presses a button, or follows a link shown as a button; a busy one ignores it."),
    new DocsKey("Space", "Presses a button; a busy one ignores it.")
  ];
  public static readonly roles: readonly string[] = [
    "The kit styles the native element, so a button keeps the button role and a link the link role, with their own type, disabled state, href and events.",
    "The label is the accessible name; an icon marked nolButtonIcon is hidden from assistive technology with aria-hidden.",
    "A busy button is marked aria-busy, and its hidden label still names it while the spinner shows.",
    "A button that stays focusable while unavailable takes aria-disabled and looks disabled; a link has no disabled state, so leave out a link to somewhere unavailable."
  ];
}
