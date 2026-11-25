/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { DomResources } from "../../dom-resources.js";

export class ContentMovedEvent extends Event {
  public readonly area: DOMRectReadOnly;
  public readonly holder: HTMLElement;

  public constructor(area: DOMRectReadOnly, holder: HTMLElement) {
    super(DomResources.contentMovedEvent);
    this.area = area;
    this.holder = holder;
  }

  public isAround(element: Element): boolean {
    for (let at: Node | null = element; !Object.isNull(at); at = at.parentNode)
      if (at === this.target)
        return true;
    return false;
  }

  public shows(box: DOMRectReadOnly): boolean {
    return box.left < this.area.right && box.right > this.area.left && box.top < this.area.bottom && box.bottom > this.area.top;
  }
}
