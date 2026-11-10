/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { IconButtonComponent, MenuComponent, MenuGroupComponent, MenuItemComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-menu-group-choices-example",
  imports: [IconButtonComponent, MenuComponent, MenuGroupComponent, MenuItemComponent, MenuTriggerDirective],
  templateUrl: "./menu-group-choices-example.component.html",
  styleUrl: "./menu-group-choices-example.component.css"
})
export class MenuGroupChoicesExampleComponent {
  protected readonly sort: WritableSignal<string> = signal("Date");
  protected readonly showsHidden: WritableSignal<boolean> = signal(false);
}
