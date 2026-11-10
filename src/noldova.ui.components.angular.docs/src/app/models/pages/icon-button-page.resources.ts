/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class IconButtonPageResources {
  public static readonly title: string = "Icon button";
  public static readonly componentName: string = "IconButtonComponent";
  public static readonly iconButtonLooksTitle: string = "Plain, danger, filled and disabled";
  public static readonly iconButtonToggleTitle: string = "A toggle that shows it is pressed, and a busy one";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the icon button, or past it; a disabled one is skipped, and a busy one keeps its place."),
    new DocsKey("Enter", "Presses the icon button; a busy one ignores it, unless it is also busyPressable."),
    new DocsKey("Space", "Presses the icon button; a busy one ignores it, unless it is also busyPressable.")
  ];
  public static readonly roles: readonly string[] = [
    "The kit styles the native button, so it keeps the button role, with its own type, disabled state and events.",
    "Its label is its accessible name, set as aria-label, since the glyph alone names nothing; the glyph is hidden from assistive technology with aria-hidden.",
    "Given pressed, it is a toggle button and reports aria-pressed, true or false; without it, it has no pressed state.",
    "A busy icon button is marked aria-busy while its spinner shows.",
    "A button that stays focusable while unavailable takes aria-disabled and looks disabled."
  ];
}
