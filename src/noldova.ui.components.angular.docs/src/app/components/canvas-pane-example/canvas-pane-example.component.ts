/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { CanvasComponent, CanvasControlsPlacement, CanvasItemDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-canvas-pane-example",
  imports: [CanvasComponent, CanvasItemDirective],
  templateUrl: "./canvas-pane-example.component.html",
  styleUrl: "./canvas-pane-example.component.css"
})
export class CanvasPaneExampleComponent {
  protected readonly floating: CanvasControlsPlacement = CanvasControlsPlacement.Floating;
  protected readonly teams: readonly string[] = ["Design", "Engineering", "Research", "Support", "Sales", "Finance"];
}
