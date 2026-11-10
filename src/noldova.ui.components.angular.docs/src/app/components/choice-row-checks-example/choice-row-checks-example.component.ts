/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { ChoiceRowComponent, ChoiceRowType } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-choice-row-checks-example",
  imports: [ChoiceRowComponent],
  templateUrl: "./choice-row-checks-example.component.html",
  styleUrl: "./choice-row-checks-example.component.css"
})
export class ChoiceRowChecksExampleComponent {
  protected readonly types: typeof ChoiceRowType = ChoiceRowType;
  protected readonly runsTests: WritableSignal<boolean> = signal(true);
  protected readonly runsLint: WritableSignal<boolean> = signal(false);
}
