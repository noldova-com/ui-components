/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, input } from "@angular/core";

import { DockingDirection } from "../../enums/docking-direction.js";
import { DockingGuideResources } from "./docking-guide.resources.js";

@Component({
  selector: "nol-docking-guide",
  templateUrl: "./docking-guide.component.html",
  styleUrl: "./docking-guide.component.css",
  host: {
    "role": "img",
    "[attr.aria-label]": "label()",
    "[attr.data-direction]": "direction()",
    "[class.nol-docking-guide-chosen]": "chosen()"
  }
})
export class DockingGuideComponent {
  protected readonly glyph: Signal<string> = computed(() => DockingGuideResources.dockingGlyphs[this.direction()]);
  protected readonly label: Signal<string> = computed(() => DockingGuideResources.dockingLabels[this.direction()]);

  public readonly direction = input.required<DockingDirection>();
  public readonly chosen = input<boolean>(false);
}
