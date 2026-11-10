/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive, ElementRef, afterEveryRender, inject, input } from "@angular/core";

import "@noldova/context.core";
import { ArgumentException } from "@noldova/context.exceptions";

import { GalleryState } from "../../enums/gallery-state.js";
import { GalleryResources } from "./gallery-resources.js";

@Directive({
  selector: "[nolGalleryHover], [nolGalleryFocus]"
})
export class GalleryStateDirective {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly marked: Map<GalleryState, Element> = new Map();

  public readonly hoverPart = input<string | undefined>(undefined, { alias: "nolGalleryHover" });
  public readonly focusPart = input<string | undefined>(undefined, { alias: "nolGalleryFocus" });

  public constructor() {
    afterEveryRender(() => {
      this.mark(this.hoverPart(), GalleryState.Hover);
      this.mark(this.focusPart(), GalleryState.Focus);
    });
  }

  private mark(part: string | undefined, state: GalleryState): void {
    if (Object.isUndefined(part))
      return;
    const target = String.isNullOrEmpty(part) ? this.host : this.host.querySelector(part);
    if (Object.isNull(target))
      throw new ArgumentException(GalleryResources.formatMissingPart(part), "part");
    const previous = this.marked.get(state);
    if (previous === target)
      return;
    previous?.removeAttribute(GalleryResources.stateAttribute);
    this.marked.set(state, target);
    target.setAttribute(GalleryResources.stateAttribute, state);
  }
}
