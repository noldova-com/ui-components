/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, ElementRef, afterNextRender, inject, input } from "@angular/core";

import "@noldova/context.core";
import { ArgumentException } from "@noldova/context.exceptions";

import { GalleryResources } from "./gallery-resources.js";

@Directive({
  selector: "[nolGalleryPress]"
})
export class GalleryPressDirective {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  public readonly part = input.required<string>({ alias: "nolGalleryPress" });

  public constructor() {
    afterNextRender(() => {
      const target = this.host.querySelector<HTMLElement>(this.part());
      if (Object.isNull(target))
        throw new ArgumentException(GalleryResources.formatMissingPart(this.part()), "part");
      target.click();
    });
  }
}
