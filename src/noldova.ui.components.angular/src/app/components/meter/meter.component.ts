/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, LOCALE_ID, type Signal, type WritableSignal, afterEveryRender, computed, inject, input, signal, viewChild } from "@angular/core";
import "@noldova/context.core";

import { MeterResources } from "./meter.resources.js";

@Component({
  selector: "nol-meter",
  templateUrl: "./meter.component.html",
  styleUrl: "./meter.component.css",
  host: {
    "role": "meter",
    "[attr.aria-label]": "label()",
    "[attr.aria-valuemin]": "minimum",
    "[attr.aria-valuemax]": "maximum",
    "[attr.aria-valuenow]": "fraction()",
    "[attr.aria-valuetext]": "valueText()",
    "[class.nol-meter-warning]": "warning()",
    "[style.--nol-meter-fraction]": "fraction()"
  }
})
export class MeterComponent {
  private readonly text: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("text");
  private readonly percent: Intl.NumberFormat = new Intl.NumberFormat(inject(LOCALE_ID), { style: "percent" });
  private readonly shownText: WritableSignal<string | null> = signal(null);

  protected readonly minimum: number = MeterResources.meterMinimum;
  protected readonly maximum: number = MeterResources.meterMaximum;
  protected readonly fraction: Signal<number> = computed(() => {
    const value = this.value();
    return Number.isNaN(value) ? this.minimum : Math.min(Math.max(value, this.minimum), this.maximum);
  });
  protected readonly valueText: Signal<string> = computed(() => this.shownText() ?? this.percent.format(this.fraction()));

  public readonly label = input.required<string>();
  public readonly value = input<number>(0);
  public readonly warning = input<boolean>(false);

  public constructor() {
    afterEveryRender({
      read: () => {
        const text = this.text().nativeElement.textContent.trim();
        this.shownText.set(String.isNullOrEmpty(text) ? null : text);
      }
    });
  }
}
