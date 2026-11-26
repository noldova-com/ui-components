/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ElementRef, type Signal, computed, inject } from "@angular/core";

import "@noldova/context.core";

import { DomResources } from "../../../dom-resources.js";
import type { IChoicePillsSource } from "../../interfaces/i-choice-pills-source.js";
import type { SelectOption } from "../../models/select-option.js";
import { ChoicePillsResources } from "./choice-pills.resources.js";

// What the choice pills do, shared by ChoicePillsComponent, whose pills take TooltipDirective, and SiteChoicePillsComponent, the site theme
// switch's, whose pills take LazyTooltipDirective; each keeps the same template and styles and builds one of these in its injection context.
// The arrow keys follow the host's own direction, read from the page rather than the Angular CDK's Directionality, so a website's start
// holds none of the CDK.
export class ChoicePillsBehavior {
  private readonly source: IChoicePillsSource;
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

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
    const key = this.host.matches(DomResources.rightToLeftSelector) ? ChoicePillsResources.choicePillMirroredKeys.get(event.key) ?? event.key : event.key;
    const to = ChoicePillsResources.choicePillTargets.get(key);
    const direction = ChoicePillsResources.choicePillDirections.get(key);
    if (Object.isUndefined(to) || Object.isUndefined(direction))
      return;
    event.preventDefault();
    const options = this.source.options();
    const indices = options.map((_, index) => index);
    const start = to(pills.indexOf(event.target), indices.length - 1);
    const ring = direction > 0 ? [...indices.slice(start), ...indices.slice(0, start)] : [...indices.slice(0, start + 1).reverse(), ...indices.slice(start + 1).reverse()];
    const next = ring.find(t => options[t]?.isDisabled === false);
    const option = Object.isUndefined(next) ? undefined : options[next];
    if (Object.isUndefined(next) || Object.isUndefined(option))
      return;
    this.choose(option);
    pills[next]?.focus();
  }
}
