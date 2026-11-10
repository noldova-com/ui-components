/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type Signal, type WritableSignal, computed, signal, viewChild } from "@angular/core";
import { FieldMessageComponent, TextFieldComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-field-message-error-example",
  imports: [FieldMessageComponent, TextFieldComponent],
  templateUrl: "./field-message-error-example.component.html",
  styleUrl: "./field-message-error-example.component.css"
})
export class FieldMessageErrorExampleComponent {
  protected readonly name: WritableSignal<string> = signal("");
  protected readonly isInvalid: Signal<boolean> = computed(() => this.name().trim().length === 0);
  protected readonly field: Signal<ElementRef<HTMLInputElement>> = viewChild.required("nameField", { read: ElementRef });
}
