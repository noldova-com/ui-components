/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { ChipComponent, ChipKind } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-chip-statuses-example",
  imports: [ChipComponent],
  templateUrl: "./chip-statuses-example.component.html",
  styleUrl: "./chip-statuses-example.component.css"
})
export class ChipStatusesExampleComponent {
  protected readonly kinds: typeof ChipKind = ChipKind;
}
