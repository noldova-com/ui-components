/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DocsKey } from "../docs-key.js";

export class SwitchPageResources {
  public static readonly title: string = "Switch";
  public static readonly componentName: string = "SwitchComponent";
  public static readonly switchTextTitle: string = "With visible text, bound to its owner";
  public static readonly switchLabelTitle: string = "Without visible text, named by label beside its context";
  public static readonly switchDisabledTitle: string = "Unavailable, with its reason";
  public static readonly keys: readonly DocsKey[] = [
    new DocsKey("Tab", "Moves the focus to the switch, or past it; a disabled switch stays in the Tab order."),
    new DocsKey("Space", "Asks the owner to turn the switch on or off; it shows the new state once its owner binds it. A disabled switch refuses it.")
  ];
  public static readonly roles: readonly string[] = [
    "A native checkbox with the switch role, which reports whether it is on; the label around it holds the text that names it, and label names a switch with no visible text, as aria-label.",
    "It is controlled: a toggle emits checkedChange, and the switch shows the new state only once its owner binds checked to it.",
    "A disabled switch is marked aria-disabled, so it stays focusable; its disabledReason shows under it and is named in aria-describedby.",
    "The knob is drawn over the track and hidden from assistive technology with aria-hidden."
  ];
}
