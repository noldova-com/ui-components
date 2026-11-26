/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, input } from "@angular/core";

import { SiteWordmarkSize } from "../../enums/site-wordmark-size.js";

import type { SiteLinkGroup } from "../../models/site-link-group.js";
import { SiteLockupComponent } from "../site-lockup/site-lockup.component.js";
import { SiteLockupResources } from "../site-lockup/site-lockup.resources.js";
import { SiteFooterResources } from "./site-footer.resources.js";

@Component({
  selector: "nol-site-footer",
  templateUrl: "./site-footer.component.html",
  styleUrl: "./site-footer.component.css",
  imports: [SiteLockupComponent],
  host: {
    "class": "nol-site-footer",
    "role": "contentinfo",
    "[class.nol-site-footer-wide]": "wide()"
  }
})
export class SiteFooterComponent {
  public readonly wordmark = input.required<string>();
  public readonly wordmarkRatio = input<number>(SiteLockupResources.wordmarkRatio);
  public readonly name = input<string | null>(null);
  public readonly homeHref = input<string>(SiteLockupResources.homeHref);
  public readonly homeLabel = input<string | null>(null);
  public readonly wordmarkSize = input<SiteWordmarkSize>(SiteWordmarkSize.Small);
  public readonly line = input<string | null>(null);
  public readonly groups = input<readonly SiteLinkGroup[]>([]);
  public readonly notice = input<string | null>(null);
  public readonly wide = input<boolean>(false);

  protected readonly partResources: typeof SiteFooterResources = SiteFooterResources;
  protected readonly year: number = new Date().getFullYear();

  protected maskOf(icon: string): string {
    return SiteLockupResources.formatMask(icon);
  }
}
