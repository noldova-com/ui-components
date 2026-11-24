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
import { SiteLinkGroup } from "../../models/site-link-group.js";
import { SiteFooterComponent } from "../site-footer/site-footer.component.js";
import { GalleryCellComponent } from "./gallery-cell.component.js";
import { GalleryResources } from "./gallery-resources.js";
import { GallerySpecimenComponent } from "./gallery-specimen.component.js";
import { GalleryStateDirective } from "./gallery-state.directive.js";

@Component({
  selector: "nol-gallery-site-footer",
  imports: [GalleryCellComponent, GallerySpecimenComponent, GalleryStateDirective, SiteFooterComponent],
  templateUrl: "./gallery-site-footer.component.html",
  styleUrl: "./gallery-navigation.component.css"
})
export class GallerySiteFooterComponent {
  protected readonly text: typeof GalleryResources.text = GalleryResources.text;
  protected readonly sizes: typeof GallerySize = GallerySize;
  protected readonly wordmark: string = GalleryResources.siteWordmark;
  protected readonly hoveredLink: string = GalleryResources.hoveredFooterLink;
  protected readonly focusedLink: string = GalleryResources.focusedFooterLink;
  protected readonly groups: readonly SiteLinkGroup[] = GalleryResources.text.siteGroups.map(([title, links], group) =>
    new SiteLinkGroup(title, links.map((t, i) => new SiteLink(t, GalleryResources.siteHref, group === 0 && i === 1))));
}
