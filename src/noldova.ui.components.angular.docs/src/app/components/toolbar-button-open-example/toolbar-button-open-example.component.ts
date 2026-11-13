/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { MenuComponent, MenuItemComponent, MenuTriggerDirective, ToolbarButtonComponent, ToolbarDirective, ToolbarItemDirective, TooltipDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-toolbar-button-open-example",
  imports: [MenuComponent, MenuItemComponent, MenuTriggerDirective, ToolbarButtonComponent, ToolbarDirective, ToolbarItemDirective, TooltipDirective],
  templateUrl: "./toolbar-button-open-example.component.html",
  styleUrl: "./toolbar-button-open-example.component.css"
})
export class ToolbarButtonOpenExampleComponent {
  protected readonly orders: readonly string[] = ["Name", "Last edited"];
  protected readonly order: WritableSignal<string> = signal("Name");
  protected readonly chosen: WritableSignal<string> = signal("Nothing yet");
}
