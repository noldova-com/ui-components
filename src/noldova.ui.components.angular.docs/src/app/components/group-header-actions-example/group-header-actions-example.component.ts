/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { GroupHeaderComponent, IconButtonComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-group-header-actions-example",
  imports: [GroupHeaderComponent, IconButtonComponent],
  templateUrl: "./group-header-actions-example.component.html",
  styleUrl: "./group-header-actions-example.component.css"
})
export class GroupHeaderActionsExampleComponent {
  protected readonly isOpen: WritableSignal<boolean> = signal(true);
}
