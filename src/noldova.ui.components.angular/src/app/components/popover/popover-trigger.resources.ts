/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { FocusOrigin } from "@angular/cdk/a11y";

export class PopoverTriggerResources {
  public static readonly popoverClass: string = "nol-popover";
  public static readonly popoverPaneClass: string = "nol-popover-pane";
  public static readonly touchPointerType: string = "touch";
  public static readonly focusOutEvent: "focusout" = "focusout";
  public static readonly returnedFocusOrigin: FocusOrigin = "program";
  public static readonly linkSelector: string = "a[href]";
}
