/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directive } from "@angular/core";

@Directive({
  selector: "[nolTextFieldEnd]",
  host: {
    "class": "nol-text-field-end",
    "data-truncates": ""
  }
})
export class TextFieldEndDirective {}
