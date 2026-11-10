/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, type WritableSignal, input, model, signal } from "@angular/core";

import { RadioGroupResources } from "./radio-group.resources.js";

@Component({
  selector: "nol-radio-group",
  template: "<ng-content />",
  styleUrl: "./radio-group.component.css",
  host: {
    "class": "nol-radio-group",
    "role": "radiogroup",
    "[attr.aria-label]": "label()",
    "(focusin)": "follow($event)",
    "(focusout)": "leave()"
  }
})
export class RadioGroupComponent {
  private static count: number = 0;

  private readonly tabStopValue: WritableSignal<string | null> = signal(null);

  public readonly name: string = `${RadioGroupResources.radioGroupNamePrefix}${RadioGroupComponent.count++}`;
  public readonly label = input.required<string>();
  public readonly value = model<string | null>(null);
  public readonly focused: Signal<string | null> = this.tabStopValue.asReadonly();

  protected follow(event: FocusEvent): void {
    const target = event.target;
    this.tabStopValue.set(target instanceof HTMLInputElement && target.name === this.name ? target.value : null);
  }

  protected leave(): void {
    this.tabStopValue.set(null);
  }
}
