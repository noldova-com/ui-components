/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, input, output } from "@angular/core";

import "@noldova/context.core";

import type { SelectOption } from "../../models/select-option.js";
import { ElementDirectionality } from "../../services/element-directionality.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { ChoicePillsBase } from "./choice-pills-base.js";

@Component({
  selector: "nol-choice-pills",
  templateUrl: "./choice-pills.component.html",
  styleUrl: "./choice-pills.component.css",
  imports: [TooltipDirective],
  providers: [ElementDirectionality.provide()],
  host: {
    "class": "nol-choice-pills"
  }
})
export class ChoicePillsComponent extends ChoicePillsBase {
  public readonly options = input.required<readonly SelectOption[]>();
  public readonly value = input.required<string>();
  public readonly label = input.required<string>();
  public readonly describedBy = input<string | null>(null);
  public readonly iconOnly = input<boolean>(false);
  public readonly valueChange = output<string>();
}
