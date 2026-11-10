/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, inject } from "@angular/core";
import { ButtonComponent, ButtonVariant, DialogService } from "@noldova/ui.components.angular";

import { DialogLargeContentExampleComponent } from "../dialog-large-content-example/dialog-large-content-example.component.js";

@Component({
  selector: "nol-docs-dialog-large-example",
  imports: [ButtonComponent],
  templateUrl: "./dialog-large-example.component.html",
  styleUrl: "./dialog-large-example.component.css"
})
export class DialogLargeExampleComponent {
  private readonly dialogs: DialogService = inject(DialogService);

  protected readonly variants: typeof ButtonVariant = ButtonVariant;

  protected show(): void {
    const dialog = this.dialogs.open(DialogLargeContentExampleComponent);
    dialog.componentInstance?.finished.subscribe(() => dialog.close());
  }
}
