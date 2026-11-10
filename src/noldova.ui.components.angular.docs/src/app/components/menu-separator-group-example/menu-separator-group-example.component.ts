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
  selector: "nol-docs-menu-separator-group-example",
  imports: [MenuComponent, MenuGroupComponent, MenuItemComponent, MenuSeparatorComponent],
  templateUrl: "./menu-separator-group-example.component.html",
  styleUrl: "./menu-separator-group-example.component.css"
})
export class MenuSeparatorGroupExampleComponent {
  protected readonly sides: readonly string[] = ["Left", "Right", "Bottom"];
  protected readonly position: WritableSignal<string> = signal("Left");
}
