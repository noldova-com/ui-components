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
  selector: "nol-docs-chip-counts-example",
  imports: [ChipComponent],
  templateUrl: "./chip-counts-example.component.html",
  styleUrl: "./chip-counts-example.component.css"
})
export class ChipCountsExampleComponent {
  protected readonly kinds: typeof ChipKind = ChipKind;
}
