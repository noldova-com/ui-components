/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type OutputEmitterRef, type Signal, output, viewChild } from "@angular/core";
import { ButtonComponent, ButtonVariant, DialogComponent, DialogSize, TextFieldComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-dialog-medium-content-example",
  imports: [ButtonComponent, DialogComponent, TextFieldComponent],
  templateUrl: "./dialog-medium-content-example.component.html",
  styleUrl: "./dialog-medium-content-example.component.css"
})
export class DialogMediumContentExampleComponent {
  protected readonly sizes: typeof DialogSize = DialogSize;
  protected readonly variants: typeof ButtonVariant = ButtonVariant;

  public readonly answered: OutputEmitterRef<string | null> = output<string | null>();

  private readonly name: Signal<ElementRef<HTMLInputElement>> = viewChild.required("name", { read: ElementRef });

  protected add(): void {
    this.answered.emit(this.name().nativeElement.value);
  }
}
