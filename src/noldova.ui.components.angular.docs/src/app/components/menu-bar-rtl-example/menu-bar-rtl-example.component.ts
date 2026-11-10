/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { MenuBarComponent, MenuBarItemComponent, MenuComponent, MenuItemComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-menu-bar-rtl-example",
  imports: [MenuBarComponent, MenuBarItemComponent, MenuComponent, MenuItemComponent, MenuTriggerDirective],
  templateUrl: "./menu-bar-rtl-example.component.html",
  styleUrl: "./menu-bar-rtl-example.component.css"
})
export class MenuBarRtlExampleComponent {
  protected readonly ran: WritableSignal<string> = signal("Nothing yet");
}
