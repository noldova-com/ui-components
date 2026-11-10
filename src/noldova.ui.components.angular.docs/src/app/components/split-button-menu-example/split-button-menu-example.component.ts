/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { MenuComponent, MenuItemComponent, SplitButtonComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-split-button-menu-example",
  imports: [MenuComponent, MenuItemComponent, SplitButtonComponent],
  templateUrl: "./split-button-menu-example.component.html",
  styleUrl: "./split-button-menu-example.component.css"
})
export class SplitButtonMenuExampleComponent {
  protected readonly opened: WritableSignal<string> = signal("Nothing yet");
}
