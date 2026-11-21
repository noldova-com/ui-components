/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, ElementRef, inject } from "@angular/core";

@Directive({
  selector: "[nolCanvasItem]"
})
export class CanvasItemDirective {
  public readonly element: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
}
