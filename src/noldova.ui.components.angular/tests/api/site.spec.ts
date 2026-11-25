/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import * as site from "@noldova/ui.components.angular/site";

import * as kit from "../../src/api/index";
import { DomFixture } from "../fixtures/dom.fixture";

@Component({
  imports: [site.SiteHeaderComponent, site.SiteFooterComponent],
  template: `
    <nol-site-header wordmark="/wordmark.svg" [links]="links" />
    <nol-site-footer wordmark="/wordmark.svg" [groups]="groups" />
  `
})
class EntrySiteHostComponent {
  protected readonly links: readonly site.SiteLink[] = [new site.SiteLink("Docs", "/docs")];
  protected readonly groups: readonly site.SiteLinkGroup[] = [new site.SiteLinkGroup("Product", [new site.SiteLink("Download", "/download")])];
}

describe("the kit's site entry", () => {
  it("publishes the site header and footer and their links, the same classes as the kit's API", () => {
    expect({ ...site }).toEqual({
      SiteFooterComponent: kit.SiteFooterComponent,
      SiteHeaderComponent: kit.SiteHeaderComponent,
      SiteLink: kit.SiteLink,
      SiteLinkGroup: kit.SiteLinkGroup,
      SiteSearchDirective: kit.SiteSearchDirective,
      SiteSocialLink: kit.SiteSocialLink
    });
  });

  it("renders a header and a footer with the components it publishes", async () => {
    const fixture = TestBed.createComponent(EntrySiteHostComponent);
    await fixture.whenStable();
    const host = DomFixture.host(fixture);

    expect([DomFixture.one(host, "nol-site-header a[href='/docs']").textContent.trim(), DomFixture.one(host, "nol-site-footer a[href='/download']").textContent.trim()])
      .toEqual(["Docs", "Download"]);
  });
});
