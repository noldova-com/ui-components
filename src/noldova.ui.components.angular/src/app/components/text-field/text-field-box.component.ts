/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type Signal, ViewEncapsulation, afterRenderEffect, contentChild, inject, input } from "@angular/core";

import { TextFieldBoxResources } from "./text-field-box.resources.js";
import { TextFieldEndDirective } from "./text-field-end.directive.js";

@Component({
  selector: "nol-text-field-box",
  templateUrl: "./text-field-box.component.html",
  styleUrl: "./text-field-box.component.css",
  encapsulation: ViewEncapsulation.None,
  host: {
    "class": "nol-text-field-box"
  }
})
export class TextFieldBoxComponent {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly end: Signal<ElementRef<HTMLElement> | undefined> = contentChild(TextFieldEndDirective, { descendants: false, read: ElementRef });

  public readonly icon = input<string | null>(null);

  public constructor() {
    afterRenderEffect(onCleanup => this.measureEnd(onCleanup));
  }

  private measureEnd(onCleanup: (cleanup: () => void) => void): void {
    const end = this.end()?.nativeElement;
    if (Object.isUndefined(end))
      return;
    const observer = new ResizeObserver(() => this.host.style.setProperty(TextFieldBoxResources.textFieldEndWidthProperty, `${end.getBoundingClientRect().width}px`));
    observer.observe(end);
    onCleanup(() => {
      observer.disconnect();
      this.host.style.removeProperty(TextFieldBoxResources.textFieldEndWidthProperty);
    });
  }
}
