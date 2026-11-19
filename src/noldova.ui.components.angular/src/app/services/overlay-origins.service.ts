/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Injectable } from "@angular/core";

import "@noldova/context.core";

@Injectable({ providedIn: "root" })
export class OverlayOriginsService {
  private readonly origins: WeakMap<Element, Element> = new WeakMap();

  public remember(pane: Element, origin: Element): void {
    this.origins.set(pane, origin);
  }

  public originOf(element: Element): Element | null {
    for (let at = element.parentElement; !Object.isNull(at); at = at.parentElement) {
      const origin = this.origins.get(at);
      if (!Object.isUndefined(origin))
        return origin;
    }
    return null;
  }
}
