/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { Component, computed, input } from "@angular/core";

@Component({
  selector: "nol-site-card",
  templateUrl: "./site-card.component.html",
  styleUrl: "./site-card.component.css",
  host: {
    "class": "nol-site-card",
    "role": "article"
  }
})
export class SiteCardComponent {
  public readonly icon = input<string | null>(null);
  public readonly index = input<string | null>(null);
  public readonly title = input.required<string>();
  public readonly text = input<string | null>(null);

  // The row over the title, which holds the icon and the index when the card has either.
  protected readonly hasHead = computed<boolean>(() => !Object.isNull(this.icon()) || !Object.isNull(this.index()));
}
