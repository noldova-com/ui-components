/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { IconButtonComponent, SectionHeaderActionDirective, SectionHeaderComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-section-header-actions-example",
  imports: [IconButtonComponent, SectionHeaderActionDirective, SectionHeaderComponent],
  templateUrl: "./section-header-actions-example.component.html",
  styleUrl: "./section-header-actions-example.component.css"
})
export class SectionHeaderActionsExampleComponent {
  protected readonly isOpen: WritableSignal<boolean> = signal(true);
  protected readonly lists: WritableSignal<readonly string[]> = signal(["Groceries", "Packing list"]);

  protected add(): void {
    this.lists.update(t => [...t, `List ${t.length + 1}`]);
    this.isOpen.set(true);
  }
}
