/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, input } from "@angular/core";

import type { SiteAction } from "../../models/site-action.js";
import type { SiteShot } from "../../models/site-shot.js";
import { ButtonComponent } from "../button/button.component.js";
import { SiteHeroResources } from "./site-hero.resources.js";

@Component({
  selector: "nol-site-hero",
  templateUrl: "./site-hero.component.html",
  styleUrl: "./site-hero.component.css",
  imports: [ButtonComponent],
  host: {
    "class": "nol-site-hero"
  }
})
export class SiteHeroComponent {
  public readonly eyebrow = input<string | null>(null);
  public readonly title = input.required<string>();
  public readonly accent = input<string | null>(null);
  public readonly closing = input<string | null>(null);
  public readonly titleId = input<string>(SiteHeroResources.titleId);
  public readonly actions = input<readonly SiteAction[]>([]);
  public readonly shot = input<SiteShot | null>(null);
  public readonly shotId = input<string | null>(null);

  protected readonly partResources: typeof SiteHeroResources = SiteHeroResources;
}
