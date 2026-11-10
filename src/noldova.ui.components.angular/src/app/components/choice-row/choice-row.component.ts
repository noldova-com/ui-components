/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import { Component, input, output } from "@angular/core";

import "@noldova/context.core";

import { ChoiceRowType } from "../../enums/choice-row-type.js";
import { CheckboxComponent } from "../checkbox/checkbox.component.js";
import { RadioComponent } from "../radio/radio.component.js";

@Component({
  selector: "nol-choice-row",
  imports: [CheckboxComponent, NgTemplateOutlet, RadioComponent],
  templateUrl: "./choice-row.component.html",
  styleUrl: "./choice-row.component.css",
  host: {
    "class": "nol-choice-row",
    "[class.nol-choice-row-disabled]": "disabled()"
  }
})
export class ChoiceRowComponent {
  protected readonly types: typeof ChoiceRowType = ChoiceRowType;

  public readonly type = input<ChoiceRowType>(ChoiceRowType.Radio);
  public readonly value = input<string>(String.empty);
  public readonly label = input.required<string>();
  public readonly description = input<string | null>(null);
  public readonly checked = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly checkedChange = output<boolean>();
}
