/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { CanvasComponent, CanvasItemDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-canvas-teams-example",
  imports: [CanvasComponent, CanvasItemDirective],
  templateUrl: "./canvas-teams-example.component.html",
  styleUrl: "./canvas-teams-example.component.css"
})
export class CanvasTeamsExampleComponent {
  protected readonly teams: readonly string[] = ["Design", "Engineering", "Research", "Support", "Sales", "Finance", "Legal", "People", "Operations"];
}
