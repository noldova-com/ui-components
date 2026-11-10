/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { ButtonComponent, ButtonVariant } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-button-variants-example",
  imports: [ButtonComponent],
  templateUrl: "./button-variants-example.component.html",
  styleUrl: "./button-variants-example.component.css"
})
export class ButtonVariantsExampleComponent {
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
}
