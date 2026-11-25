/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Directionality } from "@angular/cdk/bidi";
import { type Signal, computed, inject } from "@angular/core";

import "@noldova/context.core";

import { DomResources } from "../../../dom-resources.js";
import type { IChoicePillsSource } from "../../interfaces/i-choice-pills-source.js";
import type { SelectOption } from "../../models/select-option.js";
import { ChoicePillsResources } from "./choice-pills.resources.js";

// What the choice pills do, shared by ChoicePillsComponent, whose pills take TooltipDirective, and SiteChoicePillsComponent, the site theme
// switch's, whose pills take LazyTooltipDirective; each keeps the same template and styles and builds one of these in its injection context.
export class ChoicePillsBehavior {
  private readonly source: IChoicePillsSource;
  private readonly directionality: Directionality = inject(Directionality);

  // The pill Tab reaches: the chosen one, else the first enabled one.
  public readonly tabStop: Signal<string | undefined>;

  public constructor(source: IChoicePillsSource) {
    this.source = source;
    this.tabStop = computed(() =>
      (source.options().find(t => t.value === source.value()) ?? source.options().find(t => !t.isDisabled) ?? source.options()[0])?.value);
  }

  public choose(option: SelectOption): void {
    if (!option.isDisabled && option.value !== this.source.value())
      this.source.valueChange.emit(option.value);
  }

  public move(event: KeyboardEvent, group: HTMLElement): void {
    if (!(event.target instanceof HTMLButtonElement) || event.altKey || event.ctrlKey || event.metaKey)
      return;
    const pills = [...group.querySelectorAll<HTMLButtonElement>(ChoicePillsResources.choicePillSelector)];
    const key = this.directionality.value === DomResources.rightToLeftDirection ? ChoicePillsResources.choicePillMirroredKeys.get(event.key) ?? event.key : event.key;
    const to = ChoicePillsResources.choicePillTargets.get(key);
    const direction = ChoicePillsResources.choicePillDirections.get(key);
    if (Object.isUndefined(to) || Object.isUndefined(direction))
      return;
    event.preventDefault();
    const entries = this.source.options().map((option, index) => ({ option, index }));
    const start = to(pills.indexOf(event.target), entries.length - 1);
    const ring = direction > 0 ? [...entries.slice(start), ...entries.slice(0, start)] : [...entries.slice(0, start + 1).reverse(), ...entries.slice(start + 1).reverse()];
    const next = ring.find(t => !t.option.isDisabled);
    if (Object.isUndefined(next))
      return;
    this.choose(next.option);
    pills[next.index]?.focus();
  }
}
