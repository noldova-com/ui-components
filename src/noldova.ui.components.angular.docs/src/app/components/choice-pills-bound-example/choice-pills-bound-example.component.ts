/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { ChoicePillsComponent, SelectOption } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-choice-pills-bound-example",
  imports: [ChoicePillsComponent],
  templateUrl: "./choice-pills-bound-example.component.html",
  styleUrl: "./choice-pills-bound-example.component.css"
})
export class ChoicePillsBoundExampleComponent {
  protected readonly options: readonly SelectOption[] = [new SelectOption("low", "Low"), new SelectOption("medium", "Medium"), new SelectOption("high", "High")];
  protected readonly effort: WritableSignal<string> = signal("medium");
}
