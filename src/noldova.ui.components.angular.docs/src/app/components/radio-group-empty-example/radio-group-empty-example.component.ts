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
  selector: "nol-docs-radio-group-empty-example",
  imports: [RadioComponent, RadioGroupComponent],
  templateUrl: "./radio-group-empty-example.component.html",
  styleUrl: "./radio-group-empty-example.component.css"
})
export class RadioGroupEmptyExampleComponent {
  protected readonly layout: WritableSignal<string | null> = signal(null);
}
