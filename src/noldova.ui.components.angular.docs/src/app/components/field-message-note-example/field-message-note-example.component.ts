/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { FieldMessageComponent, FieldMessageKind, TextFieldComponent } from "@noldova/ui.components.angular";

@Component({
  selector: "nol-docs-field-message-note-example",
  imports: [FieldMessageComponent, TextFieldComponent],
  templateUrl: "./field-message-note-example.component.html",
  styleUrl: "./field-message-note-example.component.css"
})
export class FieldMessageNoteExampleComponent {
  protected readonly kinds: typeof FieldMessageKind = FieldMessageKind;
}
