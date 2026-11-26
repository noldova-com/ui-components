/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { ButtonVariant } from "../../enums/button-variant.js";
import { GallerySize } from "../../enums/gallery-size.js";
import { SiteAction } from "../../models/site-action.js";
import { SiteShot } from "../../models/site-shot.js";
import { SiteCardGridComponent } from "../site-card/site-card-grid.component.js";
import { SiteCardComponent } from "../site-card/site-card.component.js";
import { SiteClosingComponent } from "../site-closing/site-closing.component.js";
import { SiteHeroComponent } from "../site-hero/site-hero.component.js";
import { SiteSectionComponent } from "../site-section/site-section.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-site-parts",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, SiteCardComponent, SiteCardGridComponent, SiteClosingComponent, SiteHeroComponent, SiteSectionComponent],
  templateUrl: "./gallery-site-parts.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GallerySitePartsComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly action: string = GalleryResources.heroAction;
  protected readonly actions: readonly SiteAction[] = [
    new SiteAction(GalleryResources.text.siteHeroActions[0], GalleryResources.siteHref + 0, GalleryResources.text.siteHeroIcons[0], ButtonVariant.Primary),
    new SiteAction(GalleryResources.text.siteHeroActions[1], GalleryResources.siteHref + 1, GalleryResources.text.siteHeroIcons[1], ButtonVariant.Secondary)
  ];
  protected readonly shot: SiteShot = new SiteShot(GalleryResources.siteShot, GalleryResources.siteShot, 16, 9, GalleryResources.text.siteHeroAlt);
  protected readonly cards: readonly number[] = GalleryResources.text.siteCardTitles.map((_, i) => i);
  protected readonly mark: string = GalleryResources.siteSocialIcon;
  protected readonly wordmark: string = GalleryResources.siteWordmark;
  protected readonly closingLinkPart: string = GalleryResources.closingLink;
  protected readonly closingAction: SiteAction = new SiteAction(GalleryResources.text.siteClosingAction, GalleryResources.siteHref, "download");
  protected readonly closingLink: SiteAction = new SiteAction(GalleryResources.text.siteClosingLink, GalleryResources.siteHref, "arrow_forward");
}
