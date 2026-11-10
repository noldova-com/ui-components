/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { ButtonComponent, ButtonSize, ButtonVariant } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-button-link-example",
  imports: [ButtonComponent],
  templateUrl: "./button-link-example.component.html",
  styleUrl: "./button-link-example.component.css"
})
export class ButtonLinkExampleComponent {
  protected readonly secondary: ButtonVariant = ButtonVariant.Secondary;
  protected readonly compact: ButtonSize = ButtonSize.Compact;
}
