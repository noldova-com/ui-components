/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, input } from "@angular/core";

import type { LinkReferenceWorkItemState } from "../../models/link-reference-work-item-state.js";
import { Resources } from "../../../resources.js";

@Component({
  selector: "nol-link-reference-work-item-state",
  template: `<span class="nol-link-reference-work-item-dot" aria-hidden="true"></span>{{ state().label }}`,
  styleUrl: "./link-reference-work-item-state.component.css",
  host: {
    "class": "nol-link-reference-work-item-state",
    "[style.--nol-link-reference-dot]": "tone()"
  }
})
export class LinkReferenceWorkItemStateComponent {
  protected readonly tone: Signal<string> = computed(() => Resources.formatLightDark(this.state().tone.light, this.state().tone.dark));

  public readonly state = input.required<LinkReferenceWorkItemState>();
}
