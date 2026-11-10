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
  selector: "nol-docs-toolbar-button-states-example",
  imports: [MenuComponent, MenuItemComponent, MenuTriggerDirective, ToolbarButtonComponent, ToolbarDirective, ToolbarItemDirective, TooltipDirective],
  templateUrl: "./toolbar-button-states-example.component.html",
  styleUrl: "./toolbar-button-states-example.component.css"
})
export class ToolbarButtonStatesExampleComponent {
  protected readonly choices: readonly string[] = ["All notes", "Open notes", "Closed notes"];
  protected readonly isSyncing: WritableSignal<boolean> = signal(false);
  protected readonly filter: WritableSignal<string> = signal("All notes");
}
