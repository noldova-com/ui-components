/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { TextFieldBoxComponent, TextFieldComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-text-field-box-quiet-example",
  imports: [TextFieldBoxComponent, TextFieldComponent],
  templateUrl: "./text-field-box-quiet-example.component.html",
  styleUrl: "./text-field-box-quiet-example.component.css"
})
export class TextFieldBoxQuietExampleComponent {}
