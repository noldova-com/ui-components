/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { CodeBlockComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-code-block-copy-example",
  imports: [CodeBlockComponent],
  templateUrl: "./code-block-copy-example.component.html",
  styleUrl: "./code-block-copy-example.component.css"
})
export class CodeBlockCopyExampleComponent {
  protected readonly code: string = [
    "export function total(prices: readonly number[]): number {",
    "  return prices.reduce((sum, price) => sum + price, 0);",
    "}"
  ].join("\n");
}
