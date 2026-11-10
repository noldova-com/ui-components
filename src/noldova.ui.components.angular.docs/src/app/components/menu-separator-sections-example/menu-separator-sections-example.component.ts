/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { IconButtonComponent, MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-menu-separator-sections-example",
  imports: [IconButtonComponent, MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective],
  templateUrl: "./menu-separator-sections-example.component.html",
  styleUrl: "./menu-separator-sections-example.component.css"
})
export class MenuSeparatorSectionsExampleComponent {
  protected readonly chosen: WritableSignal<string> = signal("Nothing yet");
}
