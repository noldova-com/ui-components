/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, input, output } from "@angular/core";

import "@noldova/context.core";

import { Resources } from "../../../resources.js";
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

  protected readonly resources: typeof Resources = Resources;
  protected readonly tabStop: Signal<string | undefined> = computed(() =>
    (this.options().find(t => t.value === this.value()) ?? this.options().find(t => !t.isDisabled) ?? this.options()[0])?.value);

  protected choose(option: SelectOption): void {
    if (!option.isDisabled && option.value !== this.value())
      this.valueChange.emit(option.value);
  }

  protected move(event: KeyboardEvent, group: HTMLElement): void {
    if (!(event.target instanceof HTMLButtonElement))
      return;
    const pills = [...group.querySelectorAll<HTMLButtonElement>(ChoicePillsResources.choicePillSelector)];
    const to = ChoicePillsResources.choicePillTargets.get(event.key);
    const direction = ChoicePillsResources.choicePillDirections.get(event.key);
    if (Object.isUndefined(to) || Object.isUndefined(direction))
      return;
    event.preventDefault();
    const entries = this.options().map((option, index) => ({ option, index }));
    const start = to(pills.indexOf(event.target), entries.length - 1);
    const ring = direction > 0 ? [...entries.slice(start), ...entries.slice(0, start)] : [...entries.slice(0, start + 1).reverse(), ...entries.slice(start + 1).reverse()];
    const next = ring.find(t => !t.option.isDisabled);
    if (Object.isUndefined(next))
      return;
    this.choose(next.option);
    pills[next.index]?.focus();
  }
}
