/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { IconButtonComponent, TooltipDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-tooltip-description-example",
  imports: [IconButtonComponent, TooltipDirective],
  templateUrl: "./tooltip-description-example.component.html",
  styleUrl: "./tooltip-description-example.component.css"
})
export class TooltipDescriptionExampleComponent {
}
