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
  selector: "nol-docs-switch-bound-example",
  imports: [SwitchComponent],
  templateUrl: "./switch-bound-example.component.html",
  styleUrl: "./switch-bound-example.component.css"
})
export class SwitchBoundExampleComponent {
  protected readonly savesItself: WritableSignal<boolean> = signal(true);
  protected readonly playsSounds: WritableSignal<boolean> = signal(false);
}
