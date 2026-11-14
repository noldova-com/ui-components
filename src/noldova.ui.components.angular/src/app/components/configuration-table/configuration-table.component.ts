/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, ViewEncapsulation, computed, contentChildren, input } from "@angular/core";

import "@noldova/context.core";

import { ConfigurationTableDensity } from "../../enums/configuration-table-density.js";
import { ConfigurationTableActionDirective } from "./configuration-table-action.directive.js";
import { ConfigurationTableComponentResources } from "./configuration-table-component.resources.js";

@Component({
  selector: "nol-configuration-table",
  templateUrl: "./configuration-table.component.html",
  styleUrl: "./configuration-table.component.css",
  encapsulation: ViewEncapsulation.None,
  host: {
    "class": "nol-configuration-table",
    "[class.nol-configuration-table-compact]": "isCompact()"
  }
})
export class ConfigurationTableComponent {
  private readonly actions: Signal<readonly ConfigurationTableActionDirective[]> = contentChildren(ConfigurationTableActionDirective);

  protected readonly hasHeader: Signal<boolean> = computed(() => !String.isNullOrEmpty(this.heading()) || this.actions().length > 0);
  protected readonly isCompact: Signal<boolean> = computed(() => this.density() === ConfigurationTableDensity.Compact);
  protected readonly isExplanationLeading: Signal<boolean> = computed(() => String.isNullOrEmpty(this.heading()) && this.actions().length > 0 && !String.isNullOrEmpty(this.explanation()));

  public readonly heading = input<string>(String.empty);
  public readonly label = input<string>(String.empty);
  public readonly level = input<number>(ConfigurationTableComponentResources.configurationTableHeadingLevel);
  public readonly explanation = input<string>(String.empty);
  public readonly density = input<ConfigurationTableDensity>(ConfigurationTableDensity.Normal);
}
