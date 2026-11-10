/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BusyGuardResources } from "./busy-guard.resources.js";

export class BusyGuard {
  public static watch(host: HTMLElement, isBusy: () => boolean): void {
    const ignore = (event: Event): void => {
      if (!isBusy() || !BusyGuard.activates(event))
        return;
      event.preventDefault();
      event.stopImmediatePropagation();
    };
    for (const type of BusyGuardResources.busyEvents)
      host.addEventListener(type, ignore, { capture: true });
  }

  private static activates(event: Event): boolean {
    if (!(event instanceof KeyboardEvent))
      return true;
    return BusyGuardResources.busyActivationKeys.includes(event.key)
      || (BusyGuardResources.busyMenuKeys.includes(event.key) && event.target instanceof Element && event.target.hasAttribute(BusyGuardResources.ariaHasPopupAttribute));
  }
}
