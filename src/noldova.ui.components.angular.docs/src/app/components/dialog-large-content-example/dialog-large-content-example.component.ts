/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type OutputEmitterRef, output } from "@angular/core";
import { DialogComponent, DialogSize } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-dialog-large-content-example",
  imports: [DialogComponent],
  templateUrl: "./dialog-large-content-example.component.html",
  styleUrl: "./dialog-large-content-example.component.css"
})
export class DialogLargeContentExampleComponent {
  protected readonly sizes: typeof DialogSize = DialogSize;
  protected readonly changes: readonly string[] = ["Renamed Groceries to Shopping", "Added three books to Reading list", "Moved Trip plan to the archive"];

  public readonly finished: OutputEmitterRef<void> = output<void>();
}
