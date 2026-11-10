/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { ButtonComponent, ButtonVariant, TooltipDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-tooltip-described-example",
  imports: [ButtonComponent, TooltipDirective],
  templateUrl: "./tooltip-described-example.component.html",
  styleUrl: "./tooltip-described-example.component.css"
})
export class TooltipDescribedExampleComponent {
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
}
