/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, Directive, ElementRef, inject } from "@angular/core";

import "@noldova/context.core";

import { CanvasItems } from "../../models/canvas-items.js";

@Directive({
  selector: "[nolCanvasItem]"
})
export class CanvasItemDirective {
  public readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  public constructor() {
    const items = inject(CanvasItems, { optional: true });
    if (!Object.isNull(items))
      inject(DestroyRef).onDestroy(items.add(this.element));
  }
}
