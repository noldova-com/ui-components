/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { SelectComponent, SelectOption } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-select-options-example",
  imports: [SelectComponent],
  templateUrl: "./select-options-example.component.html",
  styleUrl: "./select-options-example.component.css"
})
export class SelectOptionsExampleComponent {
  protected readonly options: readonly SelectOption[] = [new SelectOption("fast", "Fast", "New"), new SelectOption("balanced", "Balanced"), new SelectOption("thorough", "Thorough")];
  protected readonly pace: WritableSignal<string> = signal("balanced");
}
