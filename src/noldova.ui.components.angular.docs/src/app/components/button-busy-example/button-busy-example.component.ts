/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { ButtonComponent, ButtonVariant } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-button-busy-example",
  imports: [ButtonComponent],
  templateUrl: "./button-busy-example.component.html",
  styleUrl: "./button-busy-example.component.css"
})
export class ButtonBusyExampleComponent {
  protected readonly text: ButtonVariant = ButtonVariant.Text;
  protected readonly isSaving: WritableSignal<boolean> = signal(false);
}
