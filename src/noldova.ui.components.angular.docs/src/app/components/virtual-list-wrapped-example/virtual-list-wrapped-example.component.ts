/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { ArrayVirtualListSource, VirtualListComponent, VirtualRowDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-virtual-list-wrapped-example",
  imports: [VirtualListComponent, VirtualRowDirective],
  templateUrl: "./virtual-list-wrapped-example.component.html",
  styleUrl: "./virtual-list-wrapped-example.component.css"
})
export class VirtualListWrappedExampleComponent {
  protected readonly tasks: ArrayVirtualListSource<string> = new ArrayVirtualListSource(Array.from({ length: 500 }, (_, t) =>
    t % 4 === 0 ? `Task ${t + 1}: read the notes from the last meeting again and write down every question still open` : `Task ${t + 1}`), t => t);
  protected readonly selected: WritableSignal<number | null> = signal(2);
}
