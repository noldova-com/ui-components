/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { IconButtonComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-icon-button-toggle-example",
  imports: [IconButtonComponent],
  templateUrl: "./icon-button-toggle-example.component.html",
  styleUrl: "./icon-button-toggle-example.component.css"
})
export class IconButtonToggleExampleComponent {
  protected readonly isWrapped: WritableSignal<boolean> = signal(false);
}
