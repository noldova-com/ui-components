/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, input, output } from "@angular/core";

import { Resources } from "../../../resources.js";

@Component({
  selector: "nol-checkbox",
  templateUrl: "./checkbox.component.html",
  styleUrl: "./checkbox.component.css",
  host: {
    "class": "nol-checkbox"
  }
})
export class CheckboxComponent {
  protected readonly resources: typeof Resources = Resources;

  public readonly checked = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly checkedChange = output<boolean>();

  protected refuse(event: Event): void {
    if (this.disabled())
      event.preventDefault();
  }

  protected toggle(event: Event): void {
    if (event.target instanceof HTMLInputElement)
      this.checkedChange.emit(event.target.checked);
  }
}
