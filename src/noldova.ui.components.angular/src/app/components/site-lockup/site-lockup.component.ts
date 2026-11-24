/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, input } from "@angular/core";

import { SiteLockupResources } from "./site-lockup.resources.js";

@Component({
  selector: "nol-site-lockup",
  templateUrl: "./site-lockup.component.html",
  styleUrl: "./site-lockup.component.css",
  host: {
    "class": "nol-site-lockup"
  }
})
export class SiteLockupComponent {
  public readonly wordmark = input.required<string>();
  public readonly name = input<string | null>(null);
  public readonly href = input<string>(SiteLockupResources.homeHref);

  protected readonly mask: Signal<string> = computed(() => SiteLockupResources.formatMask(this.wordmark()));
  protected readonly accessibleName: Signal<string> = computed(() => SiteLockupResources.formatName(this.name()));
}
