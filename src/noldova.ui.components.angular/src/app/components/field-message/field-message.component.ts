/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, input } from "@angular/core";

import { FieldMessageKind } from "../../enums/field-message-kind.js";

@Component({
  selector: "nol-field-message",
  templateUrl: "./field-message.component.html",
  styleUrl: "./field-message.component.css",
  host: {
    "class": "nol-field-message",
    "[attr.role]": "kind() === kinds.Error ? 'alert' : null",
    "[class.nol-field-message-note]": "kind() === kinds.Note"
  }
})
export class FieldMessageComponent {
  protected readonly kinds: typeof FieldMessageKind = FieldMessageKind;

  public readonly kind = input<FieldMessageKind>(FieldMessageKind.Error);
}
