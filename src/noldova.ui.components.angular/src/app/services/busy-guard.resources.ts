/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class BusyGuardResources {
  public static readonly busyEvents: readonly string[] = ["click", "auxclick", "keydown"];
  public static readonly busyActivationKeys: readonly string[] = ["Enter", " "];
  public static readonly busyMenuKeys: readonly string[] = ["ArrowDown", "ArrowUp"];
  public static readonly ariaHasPopupAttribute: string = "aria-haspopup";
}
