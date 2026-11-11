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
  selector: "nol-docs-switch-label-example",
  imports: [SwitchComponent],
  templateUrl: "./switch-label-example.component.html",
  styleUrl: "./switch-label-example.component.css"
})
export class SwitchLabelExampleComponent {
  protected readonly playsSounds: WritableSignal<boolean> = signal(false);
}
