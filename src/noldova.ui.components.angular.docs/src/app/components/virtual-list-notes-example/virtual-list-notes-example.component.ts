/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { ArrayVirtualListSource, type VirtualListChoice, VirtualListComponent, VirtualRowDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-virtual-list-notes-example",
  imports: [VirtualListComponent, VirtualRowDirective],
  templateUrl: "./virtual-list-notes-example.component.html",
  styleUrl: "./virtual-list-notes-example.component.css"
})
export class VirtualListNotesExampleComponent {
  protected readonly notes: ArrayVirtualListSource<string> = new ArrayVirtualListSource(Array.from({ length: 1000 }, (_, t) => `Note ${t + 1}`), t => t);
  protected readonly selected: WritableSignal<number | null> = signal(null);
  protected readonly chosen: WritableSignal<string> = signal("Nothing chosen yet");

  protected choose(choice: VirtualListChoice<string>): void {
    this.selected.set(choice.index);
    this.chosen.set(`Chosen: ${choice.item}`);
  }
}
