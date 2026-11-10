/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, input } from "@angular/core";

import { DockingDirection } from "../../enums/docking-direction.js";
import { DockingGuideComponent } from "../docking-guide/docking-guide.component.js";

@Component({
  selector: "nol-docking-plate",
  templateUrl: "./docking-plate.component.html",
  styleUrl: "./docking-plate.component.css",
  imports: [DockingGuideComponent]
})
export class DockingPlateComponent {
  protected readonly directions: readonly DockingDirection[] = [
    DockingDirection.Top,
    DockingDirection.Left,
    DockingDirection.Center,
    DockingDirection.Right,
    DockingDirection.Bottom
  ];

  public readonly chosen = input<DockingDirection | null>(null);
}
