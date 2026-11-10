/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, input } from "@angular/core";

import "@noldova/context.core";

@Component({
  selector: "nol-tooltip",
  templateUrl: "./tooltip.component.html",
  styleUrl: "./tooltip.component.css",
  host: {
    "class": "nol-tooltip",
    "role": "tooltip",
    "[class.nol-tooltip-described]": "isDescribed()"
  }
})
export class TooltipComponent {
  public readonly text = input.required<string>();
  public readonly description = input<string | null>(null);

  protected readonly isDescribed: Signal<boolean> = computed(() => (this.description() ?? String.empty).length > 0);
}
