/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { MenuComponent, MenuGroupComponent, MenuItemComponent, MenuSeparatorComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-menu-group-scroll-example",
  imports: [MenuComponent, MenuGroupComponent, MenuItemComponent, MenuSeparatorComponent],
  templateUrl: "./menu-group-scroll-example.component.html",
  styleUrl: "./menu-group-scroll-example.component.css"
})
export class MenuGroupScrollExampleComponent {
  protected readonly names: readonly string[] = ["Astra", "Bram", "Cleo", "Dara", "Eli", "Faye", "Gus", "Hana"];
  protected readonly responder: WritableSignal<string> = signal("Cleo");
}
