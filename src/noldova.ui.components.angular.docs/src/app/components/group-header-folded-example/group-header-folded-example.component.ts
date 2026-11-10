/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { GroupHeaderComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-group-header-folded-example",
  imports: [GroupHeaderComponent],
  templateUrl: "./group-header-folded-example.component.html",
  styleUrl: "./group-header-folded-example.component.css"
})
export class GroupHeaderFoldedExampleComponent {
  protected readonly isOpen: WritableSignal<boolean> = signal(false);
}
