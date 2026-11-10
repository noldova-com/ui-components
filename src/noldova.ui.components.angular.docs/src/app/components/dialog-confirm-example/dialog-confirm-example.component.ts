/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, inject, signal } from "@angular/core";
import { ButtonComponent, ButtonVariant, DialogService } from "@noldova/ui.components.angular";

import { DialogConfirmContentExampleComponent } from "../dialog-confirm-content-example/dialog-confirm-content-example.component.js";

@Component({
  selector: "nol-docs-dialog-confirm-example",
  imports: [ButtonComponent],
  templateUrl: "./dialog-confirm-example.component.html",
  styleUrl: "./dialog-confirm-example.component.css"
})
export class DialogConfirmExampleComponent {
  private readonly dialogs: DialogService = inject(DialogService);

  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly answer: WritableSignal<string> = signal("None yet");

  protected ask(): void {
    const dialog = this.dialogs.open(DialogConfirmContentExampleComponent, ".nol-docs-dialog-cancel");
    dialog.componentInstance?.answered.subscribe(isDeleted => {
      dialog.close();
      this.answer.set(isDeleted ? "Deleted" : "Kept");
    });
  }
}
