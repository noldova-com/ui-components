/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, input, model } from "@angular/core";

import "@noldova/context.core";

import { Resources } from "../../../resources.js";
import { GroupHeaderResources } from "./group-header.resources.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";

@Component({
  selector: "nol-group-header",
  imports: [TooltipDirective],
  templateUrl: "./group-header.component.html",
  styleUrl: "./group-header.component.css",
  host: {
    "class": "nol-group-header",
    "[class.nol-group-header-expanded]": "expanded()"
  }
})
export class GroupHeaderComponent {
  protected readonly resources: typeof Resources = Resources;

  public readonly label = input.required<string>();
  public readonly count = input<number | null>(null);
  public readonly countLabel = input<string | null>(null);
  public readonly level = input<number>(GroupHeaderResources.groupHeaderLevel);
  public readonly controls = input<string | null>(null);
  public readonly expanded = model<boolean>(true);

  protected readonly name: Signal<string | null> = computed(() => {
    const count = this.count();
    return Object.isNull(count) ? null : `${this.label()}${GroupHeaderResources.groupHeaderCountSeparator}${this.countLabel() ?? count}`;
  });

  protected toggle(): void {
    this.expanded.set(!this.expanded());
  }
}
