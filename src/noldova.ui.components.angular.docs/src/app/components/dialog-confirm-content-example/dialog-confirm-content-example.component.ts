/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type OutputEmitterRef, output } from "@angular/core";
import { ButtonComponent, ButtonVariant, DialogComponent, DialogDescriptionDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-dialog-confirm-content-example",
  imports: [ButtonComponent, DialogComponent, DialogDescriptionDirective],
  templateUrl: "./dialog-confirm-content-example.component.html",
  styleUrl: "./dialog-confirm-content-example.component.css"
})
export class DialogConfirmContentExampleComponent {
  protected readonly variants: typeof ButtonVariant = ButtonVariant;

  public readonly answered: OutputEmitterRef<boolean> = output<boolean>();
}
