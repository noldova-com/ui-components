/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, inject, input, output } from "@angular/core";

import "@noldova/context.core";

import { Resources } from "../../../resources.js";
import { RadioGroupComponent } from "./radio-group.component.js";

@Component({
  selector: "nol-radio",
  templateUrl: "./radio.component.html",
  styleUrl: "./radio.component.css",
  host: {
    "class": "nol-radio"
  }
})
export class RadioComponent {
  private readonly group: RadioGroupComponent | null = inject(RadioGroupComponent, { optional: true });

  public readonly value = input.required<string>();
  public readonly checked = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly checkedChange = output<boolean>();

  protected readonly resources: typeof Resources = Resources;
  protected readonly name: string | null = this.group?.name ?? null;
  protected readonly isChecked: Signal<boolean> = computed(() => Object.isNull(this.group) ? this.checked() : this.group.value() === this.value());
  protected readonly tabIndex: Signal<number | null> = computed(() => {
    const focused = this.group?.focused() ?? null;
    return Object.isNull(focused) || focused === this.value() ? null : -1;
  });

  protected refuse(event: Event): void {
    if (this.disabled())
      event.preventDefault();
  }

  protected pick(): void {
    this.group?.value.set(this.value());
    this.checkedChange.emit(true);
  }
}
