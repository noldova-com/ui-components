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
  selector: "nol-docs-radio-group-value-example",
  imports: [RadioComponent, RadioGroupComponent],
  templateUrl: "./radio-group-value-example.component.html",
  styleUrl: "./radio-group-value-example.component.css"
})
export class RadioGroupValueExampleComponent {
  protected readonly method: WritableSignal<string | null> = signal("squash");
}
