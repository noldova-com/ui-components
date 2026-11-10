/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { ChoiceRowComponent, RadioGroupComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-choice-row-radios-example",
  imports: [ChoiceRowComponent, RadioGroupComponent],
  templateUrl: "./choice-row-radios-example.component.html",
  styleUrl: "./choice-row-radios-example.component.css"
})
export class ChoiceRowRadiosExampleComponent {
  protected readonly base: WritableSignal<string | null> = signal("main");
}
