/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { CheckboxComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-checkbox-bound-example",
  imports: [CheckboxComponent],
  templateUrl: "./checkbox-bound-example.component.html",
  styleUrl: "./checkbox-bound-example.component.css"
})
export class CheckboxBoundExampleComponent {
  protected readonly runsTests: WritableSignal<boolean> = signal(true);
  protected readonly wrapsLines: WritableSignal<boolean> = signal(false);
}
