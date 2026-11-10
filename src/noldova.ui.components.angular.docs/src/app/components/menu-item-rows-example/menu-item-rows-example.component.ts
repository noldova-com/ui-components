/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { MenuComponent, MenuItemComponent, MenuSeparatorComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-menu-item-rows-example",
  imports: [MenuComponent, MenuItemComponent, MenuSeparatorComponent],
  templateUrl: "./menu-item-rows-example.component.html",
  styleUrl: "./menu-item-rows-example.component.css"
})
export class MenuItemRowsExampleComponent {
  protected readonly chosen: WritableSignal<string> = signal("Nothing yet");
}
