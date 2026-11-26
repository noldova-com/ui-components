/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { Component, type Signal, computed, input } from "@angular/core";

import type { SiteAction } from "../../models/site-action.js";
import { ButtonComponent } from "../button/button.component.js";

@Component({
  selector: "nol-site-closing",
  templateUrl: "./site-closing.component.html",
  styleUrl: "./site-closing.component.css",
  imports: [ButtonComponent],
  host: {
    "class": "nol-site-closing"
  }
})
export class SiteClosingComponent {
  public readonly mark = input<string | null>(null);
  public readonly markDark = input<string | null>(null);
  public readonly eyebrow = input<string | null>(null);
  public readonly title = input<string | null>(null);
  public readonly headingId = input.required<string>();
  public readonly action = input<SiteAction | null>(null);
  public readonly link = input<SiteAction | null>(null);

  // The mark dark mode draws in the mark's place, when the site gives one with a mark.
  protected readonly darkMark: Signal<string | null> = computed(() => {
    const dark = this.markDark();
    return !String.isNullOrWhitespace(this.mark()) && !String.isNullOrWhitespace(dark) ? dark : null;
  });
  protected readonly hasDarkMark: Signal<boolean> = computed(() => !Object.isNull(this.darkMark()));
  protected readonly hasActions = computed(() => !Object.isNull(this.action()) || !Object.isNull(this.link()));
}
