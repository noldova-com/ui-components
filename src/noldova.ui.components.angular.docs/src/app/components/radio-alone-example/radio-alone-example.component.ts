/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { RadioComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-radio-alone-example",
  imports: [RadioComponent],
  templateUrl: "./radio-alone-example.component.html",
  styleUrl: "./radio-alone-example.component.css"
})
export class RadioAloneExampleComponent {
  protected readonly isDraft: WritableSignal<boolean> = signal(false);
}
