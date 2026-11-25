/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, input } from "@angular/core";

import { SiteWordmarkSize } from "../../enums/site-wordmark-size.js";
import { SiteLockupResources } from "./site-lockup.resources.js";

@Component({
  selector: "nol-site-lockup",
  templateUrl: "./site-lockup.component.html",
  styleUrl: "./site-lockup.component.css",
  host: {
    "class": "nol-site-lockup",
    "[class.nol-site-lockup-with-icon]": "hasIcon()",
    "[class.nol-site-lockup-large]": "isLarge()",
    "[style.--nol-site-lockup-ratio]": "wordmarkRatio()"
  }
})
export class SiteLockupComponent {
  public readonly wordmark = input.required<string>();
  public readonly wordmarkRatio = input<number>(SiteLockupResources.wordmarkRatio);
  public readonly name = input<string | null>(null);
  public readonly href = input<string>(SiteLockupResources.homeHref);
  public readonly icon = input<string | null>(null);
  public readonly iconDark = input<string | null>(null);
  public readonly label = input<string | null>(null);
  public readonly wordmarkSize = input<SiteWordmarkSize>(SiteWordmarkSize.Small);

  protected readonly mask: Signal<string> = computed(() => SiteLockupResources.formatMask(this.wordmark()));
  protected readonly shownName: Signal<string | null> = computed(() => {
    const name = this.name();
    return String.isNullOrWhitespace(name) ? null : name;
  });
  protected readonly reservedRatio: Signal<string> = computed(() => SiteLockupResources.formatRatio(this.wordmarkRatio()));
  protected readonly hasIcon: Signal<boolean> = computed(() => !String.isNullOrWhitespace(this.icon()));
  protected readonly darkIcon: Signal<string | null> = computed(() => {
    const dark = this.iconDark();
    return this.hasIcon() && !String.isNullOrWhitespace(dark) ? dark : null;
  });
  protected readonly hasDarkIcon: Signal<boolean> = computed(() => !Object.isNull(this.darkIcon()));
  protected readonly isLarge: Signal<boolean> = computed(() => this.wordmarkSize() === SiteWordmarkSize.Large);
  protected readonly accessibleName: Signal<string> = computed(() => {
    const label = this.label();
    return String.isNullOrWhitespace(label) ? SiteLockupResources.formatName(this.name()) : label;
  });
}
