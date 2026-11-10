/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, input, model } from "@angular/core";

import { SectionHeaderResources } from "./section-header.resources.js";

@Component({
  selector: "nol-section-header",
  templateUrl: "./section-header.component.html",
  styleUrl: "./section-header.component.css",
  host: {
    "class": "nol-section-header",
    "role": "heading",
    "[attr.aria-level]": "level()",
    "[class.nol-section-header-with-icon]": "!!icon()",
    "[class.nol-section-header-collapsible]": "collapsible()",
    "[class.nol-section-header-uppercase]": "uppercase()",
    "[class.nol-section-header-collapsed]": "collapsible() && !expanded()"
  }
})
export class SectionHeaderComponent {
  protected readonly partResources: typeof SectionHeaderResources = SectionHeaderResources;

  public readonly label = input.required<string>();
  public readonly level = input<number>(SectionHeaderResources.sectionHeaderLevel);
  public readonly icon = input<string | null>(null);
  public readonly collapsible = input<boolean>(false);
  public readonly uppercase = input<boolean>(false);
  public readonly controls = input<string | null>(null);
  public readonly expanded = model<boolean>(true);

  protected toggle(): void {
    this.expanded.set(!this.expanded());
  }
}
