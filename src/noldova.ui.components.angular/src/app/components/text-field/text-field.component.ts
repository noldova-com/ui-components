/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, input } from "@angular/core";

@Component({
  selector: "input[nol-text-field], textarea[nol-text-field]",
  templateUrl: "./text-field.component.html",
  styleUrl: "./text-field.component.css",
  host: {
    "class": "nol-text-field",
    "[class.nol-text-field-quiet]": "quiet()"
  }
})
export class TextFieldComponent {
  public readonly quiet = input<boolean>(false);
}
