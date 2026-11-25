/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { SiteFooterComponent, SiteHeaderComponent, SiteLink, SiteLinkGroup, SiteSocialLink } from "@noldova/ui.components.angular/site";

@Component({
  selector: "nol-site-start-app",
  imports: [SiteHeaderComponent, SiteFooterComponent],
  template: `
    <nol-site-header wordmark="/wordmark.svg" [links]="links" [social]="social" />
    <main id="main" tabindex="-1">Content</main>
    <nol-site-footer wordmark="/wordmark.svg" [groups]="groups" />
  `
})
export class SiteStartAppComponent {
  protected readonly links: readonly SiteLink[] = [new SiteLink("Docs", "/docs")];
  protected readonly social: readonly SiteSocialLink[] = [new SiteSocialLink("GitHub", "https://github.com/noldova-com", "code")];
  protected readonly groups: readonly SiteLinkGroup[] = [new SiteLinkGroup("Product", [new SiteLink("Download", "/download")])];
}
