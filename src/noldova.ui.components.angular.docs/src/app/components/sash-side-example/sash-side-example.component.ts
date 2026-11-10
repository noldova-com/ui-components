/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type WritableSignal, signal } from "@angular/core";
import { SashComponent, SashOrientation } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-sash-side-example",
  imports: [SashComponent],
  templateUrl: "./sash-side-example.component.html",
  styleUrl: "./sash-side-example.component.css"
})
export class SashSideExampleComponent {
  protected readonly orientations: typeof SashOrientation = SashOrientation;
  protected readonly minimum: number = 64;
  protected readonly maximum: number = 160;
  protected readonly width: WritableSignal<number> = signal(112);

  protected resize(delta: number): void {
    this.width.update(t => Math.min(this.maximum, Math.max(this.minimum, t + delta)));
  }
}
