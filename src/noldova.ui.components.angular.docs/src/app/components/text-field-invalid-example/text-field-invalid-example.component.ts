/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { FieldMessageComponent, TextFieldComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-text-field-invalid-example",
  imports: [FieldMessageComponent, TextFieldComponent],
  templateUrl: "./text-field-invalid-example.component.html",
  styleUrl: "./text-field-invalid-example.component.css"
})
export class TextFieldInvalidExampleComponent {}
