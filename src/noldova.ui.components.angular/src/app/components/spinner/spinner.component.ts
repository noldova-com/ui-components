/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, inject, input } from "@angular/core";

import { RevealDelayDirective } from "../progress/reveal-delay.directive.js";

@Component({
  selector: "nol-spinner",
  templateUrl: "./spinner.component.html",
  styleUrl: "./spinner.component.css",
  hostDirectives: [{ directive: RevealDelayDirective, inputs: ["isDelayed"] }],
  host: {
    "[attr.role]": "label() ? 'status' : null"
  }
})
export class SpinnerComponent {
  protected readonly reveal: RevealDelayDirective = inject(RevealDelayDirective, { self: true });

  public readonly label = input<string>(String.empty);
}
