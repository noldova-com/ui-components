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
  selector: "nol-docs-sash-output-example",
  imports: [SashComponent],
  templateUrl: "./sash-output-example.component.html",
  styleUrl: "./sash-output-example.component.css"
})
export class SashOutputExampleComponent {
  protected readonly orientations: typeof SashOrientation = SashOrientation;
  protected readonly minimum: number = 32;
  protected readonly maximum: number = 96;
  protected readonly height: WritableSignal<number> = signal(48);

  protected resize(delta: number): void {
    this.height.update(t => Math.min(this.maximum, Math.max(this.minimum, t - delta)));
  }
}
