/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { ToolbarButtonComponent, ToolbarDirective, ToolbarItemDirective, TooltipDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-toolbar-button-toolbar-example",
  imports: [ToolbarButtonComponent, ToolbarDirective, ToolbarItemDirective, TooltipDirective],
  templateUrl: "./toolbar-button-toolbar-example.component.html",
  styleUrl: "./toolbar-button-toolbar-example.component.css"
})
export class ToolbarButtonToolbarExampleComponent {
  protected readonly count: WritableSignal<number> = signal(0);
  protected readonly isWrapped: WritableSignal<boolean> = signal(false);
  protected readonly shared: WritableSignal<number> = signal(0);

  protected share(): void {
    if (this.count() > 0)
      this.shared.update(t => t + 1);
  }
}
