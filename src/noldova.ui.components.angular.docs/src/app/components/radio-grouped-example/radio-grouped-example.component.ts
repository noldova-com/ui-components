/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { RadioComponent, RadioGroupComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-radio-grouped-example",
  imports: [RadioComponent, RadioGroupComponent],
  templateUrl: "./radio-grouped-example.component.html",
  styleUrl: "./radio-grouped-example.component.css"
})
export class RadioGroupedExampleComponent {
  protected readonly ending: WritableSignal<string | null> = signal("lf");
}
