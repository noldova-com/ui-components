/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { SectionHeaderComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-section-header-collapsible-example",
  imports: [SectionHeaderComponent],
  templateUrl: "./section-header-collapsible-example.component.html",
  styleUrl: "./section-header-collapsible-example.component.css"
})
export class SectionHeaderCollapsibleExampleComponent {
  protected readonly isOpen: WritableSignal<boolean> = signal(true);
}
