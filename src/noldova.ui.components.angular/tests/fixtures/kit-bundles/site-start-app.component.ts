/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { SiteAction, SiteCardComponent, SiteCardGridComponent, SiteFooterComponent, SiteHeaderComponent, SiteHeroComponent, SiteLink, SiteLinkGroup, SiteSectionComponent, SiteShot,
  SiteSocialLink } from "@noldova/ui.components.angular/site";

@Component({
  selector: "nol-site-start-app",
  imports: [SiteCardComponent, SiteCardGridComponent, SiteHeaderComponent, SiteHeroComponent, SiteFooterComponent, SiteSectionComponent],
  template: `
    <nol-site-header wordmark="/wordmark.svg" [links]="links" [social]="social" />
    <main id="main" tabindex="-1">
      <nol-site-hero eyebrow="Start" title="A product," accent="for a team." [actions]="actions" [shot]="shot">Content</nol-site-hero>
      <nol-site-section title="Features" headingId="features">
        <nol-site-card-grid><nol-site-card icon="forum" index="01" title="One chat" text="Content" /></nol-site-card-grid>
      </nol-site-section>
    </main>
    <nol-site-footer wordmark="/wordmark.svg" [groups]="groups" />
  `
})
export class SiteStartAppComponent {
  protected readonly links: readonly SiteLink[] = [new SiteLink("Docs", "/docs")];
  protected readonly social: readonly SiteSocialLink[] = [new SiteSocialLink("GitHub", "https://github.com/noldova-com", "code")];
  protected readonly groups: readonly SiteLinkGroup[] = [new SiteLinkGroup("Product", [new SiteLink("Download", "/download")])];
  protected readonly actions: readonly SiteAction[] = [new SiteAction("Download", "/download", "download")];
  protected readonly shot: SiteShot = new SiteShot("/light.png", "/dark.png", 1438, 1022, "The product");
}
