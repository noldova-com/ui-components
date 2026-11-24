/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";

import { GallerySize } from "../../enums/gallery-size.js";
import { SiteLink } from "../../models/site-link.js";
import { SiteSocialLink } from "../../models/site-social-link.js";
import { SiteHeaderComponent } from "../site-header/site-header.component.js";
import { SiteSearchDirective } from "../site-header/site-search.directive.js";
import { TextFieldComponent } from "../text-field/text-field.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-site-header",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, SiteHeaderComponent, SiteSearchDirective, TextFieldComponent],
  templateUrl: "./gallery-site-header.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GallerySiteHeaderComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly wordmark: string = GalleryResources.siteWordmark;
  protected readonly href: string = GalleryResources.siteHref;
  protected readonly hoveredLink: string = GalleryResources.hoveredSiteLink;
  protected readonly focusedLink: string = GalleryResources.focusedSiteLink;
  protected readonly links: readonly SiteLink[] = GalleryResources.text.siteLinks.map((t, i) => new SiteLink(t, GalleryResources.siteHref, i === 0));
  protected readonly social: readonly SiteSocialLink[] = GalleryResources.text.siteSocial.map(t => new SiteSocialLink(t, GalleryResources.siteHref, GalleryResources.siteSocialIcon));
}
