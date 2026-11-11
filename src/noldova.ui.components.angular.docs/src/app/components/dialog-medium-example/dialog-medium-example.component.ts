/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, inject, signal } from "@angular/core";
import { ButtonComponent, ButtonVariant, DialogService } from "@noldova/ui.components.angular";

import { DialogMediumContentExampleComponent } from "../dialog-medium-content-example/dialog-medium-content-example.component.js";

@Component({
  selector: "nol-docs-dialog-medium-example",
  imports: [ButtonComponent],
  templateUrl: "./dialog-medium-example.component.html",
  styleUrl: "./dialog-medium-example.component.css"
})
export class DialogMediumExampleComponent {
  private readonly dialogs: DialogService = inject(DialogService);

  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly added: WritableSignal<string> = signal("No one yet");

  protected add(): void {
    const dialog = this.dialogs.open(DialogMediumContentExampleComponent, "#nol-docs-teammate-name");
    dialog.componentInstance?.answered.subscribe(name => {
      dialog.close();
      if (name !== null)
        this.added.set(name);
    });
  }
}
