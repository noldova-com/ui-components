/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { TextFieldBoxComponent, TextFieldComponent, TextFieldEndDirective } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-text-field-box-end-example",
  imports: [TextFieldBoxComponent, TextFieldComponent, TextFieldEndDirective],
  templateUrl: "./text-field-box-end-example.component.html",
  styleUrl: "./text-field-box-end-example.component.css"
})
export class TextFieldBoxEndExampleComponent {}
