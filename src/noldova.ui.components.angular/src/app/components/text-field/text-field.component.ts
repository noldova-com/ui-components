/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

@Component({
  selector: "input[nol-text-field], textarea[nol-text-field]",
  templateUrl: "./text-field.component.html",
  styleUrl: "./text-field.component.css",
  host: {
    "class": "nol-text-field"
  }
})
export class TextFieldComponent {}
