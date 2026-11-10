/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { MenuBarComponent, MenuBarItemComponent, MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-menu-bar-item-submenu-example",
  imports: [MenuBarComponent, MenuBarItemComponent, MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective],
  templateUrl: "./menu-bar-item-submenu-example.component.html",
  styleUrl: "./menu-bar-item-submenu-example.component.css"
})
export class MenuBarItemSubmenuExampleComponent {
  protected readonly notes: readonly string[] = ["Groceries", "Reading list", "Trip plan"];
  protected readonly opened: WritableSignal<string> = signal("Nothing yet");
}
