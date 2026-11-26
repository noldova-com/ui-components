/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { SiteCardComponent, SiteCardGridComponent } from "@noldova/ui.components.angular/site/card";
import { SiteClosingComponent } from "@noldova/ui.components.angular/site/closing";
import { SiteAction, SiteHeroComponent, SiteShot } from "@noldova/ui.components.angular/site/hero";
import { SiteSectionComponent } from "@noldova/ui.components.angular/site/section";

@Component({
  selector: "nol-site-home-page",
  imports: [SiteCardComponent, SiteCardGridComponent, SiteClosingComponent, SiteHeroComponent, SiteSectionComponent],
  template: `
    <nol-site-hero eyebrow="Start" title="A product," accent="for a team." [actions]="actions" [shot]="shot">Content</nol-site-hero>
    <nol-site-section title="Features" headingId="features">
      <nol-site-card-grid><nol-site-card icon="forum" index="01" title="One chat" text="Content" /></nol-site-card-grid>
    </nol-site-section>
    <nol-site-closing title="Ready" headingId="closing" [action]="download">Made by a team</nol-site-closing>
  `
})
export class SiteHomePageComponent {
  protected readonly download: SiteAction = new SiteAction("Download", "/download", "download");
  protected readonly actions: readonly SiteAction[] = [this.download];
  protected readonly shot: SiteShot = new SiteShot("/light.png", "/dark.png", 1438, 1022, "The product");
}
