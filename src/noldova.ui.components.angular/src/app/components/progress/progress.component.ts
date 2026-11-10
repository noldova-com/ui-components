/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, input } from "@angular/core";

import { ProgressResources } from "./progress.resources.js";
import { RevealDelayDirective } from "./reveal-delay.directive.js";

@Component({
  selector: "nol-progress",
  templateUrl: "./progress.component.html",
  styleUrl: "./progress.component.css",
  hostDirectives: [{ directive: RevealDelayDirective, inputs: ["isDelayed"] }],
  host: {
    "role": "progressbar",
    "[attr.aria-label]": "label()",
    "[attr.aria-valuemin]": "minimum",
    "[attr.aria-valuemax]": "maximum",
    "[attr.aria-valuenow]": "fraction()",
    "[class.nol-progress-indeterminate]": "isIndeterminate()",
    "[style.--nol-progress-fraction]": "fraction()"
  }
})
export class ProgressComponent {
  protected readonly minimum: number = ProgressResources.progressMinimum;
  protected readonly maximum: number = ProgressResources.progressMaximum;
  protected readonly fraction: Signal<number | null> = computed(() => {
    const value = this.value();
    return value === null ? null : Math.min(Math.max(value, this.minimum), this.maximum);
  });
  protected readonly isIndeterminate: Signal<boolean> = computed(() => this.fraction() === null);

  public readonly label = input.required<string>();
  public readonly value = input<number | null>(null);
}
