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
  selector: "nol-docs-menu-item-checks-example",
  imports: [ButtonComponent, MenuComponent, MenuItemComponent, MenuSeparatorComponent, MenuTriggerDirective],
  templateUrl: "./menu-item-checks-example.component.html",
  styleUrl: "./menu-item-checks-example.component.css"
})
export class MenuItemChecksExampleComponent {
  protected readonly variants: typeof ButtonVariant = ButtonVariant;
  protected readonly isWrapped: WritableSignal<boolean> = signal(false);
  protected readonly density: WritableSignal<string> = signal("Compact");
  protected readonly theme: WritableSignal<string> = signal("Dark");
}
