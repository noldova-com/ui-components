/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { NgTemplateOutlet } from "@angular/common";
import { Component, type Signal, computed, contentChildren, input, model } from "@angular/core";

import type { IconName } from "../../models/icon-name.js";
import { SectionHeaderActionDirective } from "./section-header-action.directive.js";
import { SectionHeaderResources } from "./section-header.resources.js";

@Component({
  selector: "nol-section-header",
  templateUrl: "./section-header.component.html",
  styleUrl: "./section-header.component.css",
  imports: [NgTemplateOutlet],
  host: {
    "class": "nol-section-header",
    "[attr.role]": "hasActions() ? null : 'heading'",
    "[attr.aria-level]": "hasActions() ? null : level()",
    "[class.nol-section-header-with-actions]": "hasActions()",
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
  public readonly icon = input<IconName | null>(null);
  public readonly collapsible = input<boolean>(false);
  public readonly uppercase = input<boolean>(false);
  public readonly controls = input<string | null>(null);
  public readonly expanded = model<boolean>(true);

  private readonly actions: Signal<readonly SectionHeaderActionDirective[]> = contentChildren(SectionHeaderActionDirective);
  protected readonly hasActions: Signal<boolean> = computed(() => this.actions().length > 0);

  protected toggle(): void {
    this.expanded.set(!this.expanded());
  }
}
