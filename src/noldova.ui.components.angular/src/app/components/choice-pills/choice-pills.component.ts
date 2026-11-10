/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, input, output } from "@angular/core";

import "@noldova/context.core";

import type { SelectOption } from "../../models/select-option.js";
import { ChoicePillsResources } from "./choice-pills.resources.js";

@Component({
  selector: "nol-choice-pills",
  templateUrl: "./choice-pills.component.html",
  styleUrl: "./choice-pills.component.css",
  host: {
    "class": "nol-choice-pills"
  }
})
export class ChoicePillsComponent {
  public readonly options = input.required<readonly SelectOption[]>();
  public readonly value = input.required<string>();
  public readonly label = input.required<string>();
  public readonly describedBy = input<string | null>(null);
  public readonly valueChange = output<string>();

  protected readonly tabStop: Signal<string | undefined> = computed(() => (this.options().find(t => t.value === this.value()) ?? this.options()[0])?.value);

  protected choose(value: string): void {
    if (value !== this.value())
      this.valueChange.emit(value);
  }

  protected move(event: KeyboardEvent, group: HTMLElement): void {
    if (!(event.target instanceof HTMLButtonElement))
      return;
    const pills = [...group.querySelectorAll<HTMLButtonElement>(ChoicePillsResources.choicePillSelector)];
    const target = ChoicePillsResources.choicePillTargets.get(event.key)?.(pills.indexOf(event.target), pills.length - 1);
    if (Object.isUndefined(target))
      return;
    event.preventDefault();
    this.choose((this.options()[target] as SelectOption).value);
    (pills[target] as HTMLButtonElement).focus();
  }
}
