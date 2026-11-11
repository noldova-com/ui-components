/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { SwitchComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-switch-text-example",
  imports: [SwitchComponent],
  templateUrl: "./switch-text-example.component.html",
  styleUrl: "./switch-text-example.component.css"
})
export class SwitchTextExampleComponent {
  protected readonly savesItself: WritableSignal<boolean> = signal(true);
}
