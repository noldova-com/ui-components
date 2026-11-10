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
import { SwitchResources } from "./switch.resources.js";

@Component({
  selector: "nol-switch",
  templateUrl: "./switch.component.html",
  styleUrl: "./switch.component.css",
  host: {
    "class": "nol-switch"
  }
})
export class SwitchComponent {
  private static count: number = 0;

  protected readonly resources: typeof Resources = Resources;
  protected readonly reasonId: string = `${SwitchResources.switchReasonIdPrefix}${SwitchComponent.count++}`;
  protected readonly shownReason: Signal<string | null> = computed(() => {
    const reason = this.disabledReason();
    return this.disabled() && !String.isNullOrEmpty(reason) ? reason : null;
  });

  public readonly checked = input<boolean>(false);
  public readonly disabled = input<boolean>(false);
  public readonly disabledReason = input<string | null>(null);
  public readonly label = input<string | null>(null);
  public readonly checkedChange = output<boolean>();

  protected refuse(event: Event): void {
    if (this.disabled())
      event.preventDefault();
  }

  protected askOwnerToToggle(track: HTMLInputElement): void {
    this.checkedChange.emit(track.checked);
    track.checked = this.checked();
  }
}
