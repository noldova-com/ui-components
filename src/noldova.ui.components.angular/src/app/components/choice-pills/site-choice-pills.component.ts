/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, input, output } from "@angular/core";

import "@noldova/context.core";

import { DomResources } from "../../../dom-resources.js";
import type { SelectOption } from "../../models/select-option.js";
import { LazyTooltipDirective } from "../tooltip/lazy-tooltip.directive.js";
import { ChoicePillsBehavior } from "./choice-pills-behavior.js";

// The site theme switch's choice pills: ChoicePillsComponent's template, styles and behavior, with LazyTooltipDirective on each pill, so a
// website's start holds no tooltip engine.
@Component({
  selector: "nol-site-choice-pills",
  templateUrl: "./choice-pills.component.html",
  styleUrl: "./choice-pills.component.css",
  imports: [LazyTooltipDirective],
  host: {
    "class": "nol-choice-pills"
  }
})
export class SiteChoicePillsComponent {
  public readonly options = input.required<readonly SelectOption[]>();
  public readonly value = input.required<string>();
  public readonly label = input.required<string>();
  public readonly describedBy = input<string | null>(null);
  public readonly iconOnly = input<boolean>(false);
  public readonly valueChange = output<string>();

  protected readonly domResources: typeof DomResources = DomResources;
  protected readonly pills: ChoicePillsBehavior = new ChoicePillsBehavior(this);
}
