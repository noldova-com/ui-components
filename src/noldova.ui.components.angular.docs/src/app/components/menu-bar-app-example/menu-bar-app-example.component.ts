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
  selector: "nol-docs-menu-bar-app-example",
  imports: [MenuBarComponent, MenuBarItemComponent, MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective],
  templateUrl: "./menu-bar-app-example.component.html",
  styleUrl: "./menu-bar-app-example.component.css"
})
export class MenuBarAppExampleComponent {
  protected readonly ran: WritableSignal<string> = signal("Nothing yet");
}
