/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type OutputEmitterRef, output } from "@angular/core";
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
}
