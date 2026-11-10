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
  selector: "nol-docs-menu-inline-example",
  imports: [MenuComponent, MenuItemComponent, MenuSeparatorComponent],
  templateUrl: "./menu-inline-example.component.html",
  styleUrl: "./menu-inline-example.component.css"
})
export class MenuInlineExampleComponent {
  protected readonly chosen: WritableSignal<string> = signal("Nothing yet");
  protected readonly showsHidden: WritableSignal<boolean> = signal(false);
}
