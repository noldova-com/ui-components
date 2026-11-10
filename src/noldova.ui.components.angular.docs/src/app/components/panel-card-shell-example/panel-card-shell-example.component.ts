/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { PanelCardComponent, PanelSurface } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-panel-card-shell-example",
  imports: [PanelCardComponent],
  templateUrl: "./panel-card-shell-example.component.html",
  styleUrl: "./panel-card-shell-example.component.css"
})
export class PanelCardShellExampleComponent {
  protected readonly surfaces: typeof PanelSurface = PanelSurface;
}
