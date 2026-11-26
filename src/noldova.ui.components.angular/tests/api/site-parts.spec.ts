/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as site from "@noldova/ui.components.angular/site";
import * as card from "@noldova/ui.components.angular/site/card";
import * as closing from "@noldova/ui.components.angular/site/closing";
import * as footer from "@noldova/ui.components.angular/site/footer";
import * as header from "@noldova/ui.components.angular/site/header";
import * as hero from "@noldova/ui.components.angular/site/hero";
import * as section from "@noldova/ui.components.angular/site/section";

describe("the kit's site part entries", () => {
  it("publish each part with the models its inputs take, the same classes as the site entry", () => {
    expect({ card: { ...card }, closing: { ...closing }, footer: { ...footer }, header: { ...header }, hero: { ...hero }, section: { ...section } }).toEqual({
      card: { SiteCardComponent: site.SiteCardComponent, SiteCardGridComponent: site.SiteCardGridComponent },
      closing: { SiteAction: site.SiteAction, SiteClosingComponent: site.SiteClosingComponent },
      footer: { SiteFooterComponent: site.SiteFooterComponent, SiteLink: site.SiteLink, SiteLinkGroup: site.SiteLinkGroup, SiteWordmarkSize: site.SiteWordmarkSize },
      header: { SiteHeaderComponent: site.SiteHeaderComponent, SiteLink: site.SiteLink, SiteSearchDirective: site.SiteSearchDirective, SiteSocialLink: site.SiteSocialLink, SiteWordmarkSize: site.SiteWordmarkSize },
      hero: { SiteAction: site.SiteAction, SiteHeroComponent: site.SiteHeroComponent, SiteShot: site.SiteShot },
      section: { SiteSectionComponent: site.SiteSectionComponent }
    });
  });
});
