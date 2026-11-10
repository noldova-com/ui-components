/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { IconButtonComponent, TextFieldBoxComponent, TextFieldComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-text-field-box-action-example",
  imports: [IconButtonComponent, TextFieldBoxComponent, TextFieldComponent],
  templateUrl: "./text-field-box-action-example.component.html",
  styleUrl: "./text-field-box-action-example.component.css"
})
export class TextFieldBoxActionExampleComponent {}
