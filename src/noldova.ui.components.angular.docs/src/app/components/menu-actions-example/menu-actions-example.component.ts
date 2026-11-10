/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { ButtonComponent, ButtonVariant, MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-menu-actions-example",
  imports: [ButtonComponent, MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective],
  templateUrl: "./menu-actions-example.component.html",
  styleUrl: "./menu-actions-example.component.css"
})
export class MenuActionsExampleComponent {
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly chosen: WritableSignal<string> = signal("Nothing yet");
}
