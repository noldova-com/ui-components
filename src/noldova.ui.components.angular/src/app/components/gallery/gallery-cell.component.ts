/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, HostAttributeToken, inject, input } from "@angular/core";

import "@noldova/context.core";

import { GalleryResources } from "./gallery-resources.js";

@Component({
  selector: "nol-gallery-cell",
  templateUrl: "./gallery-cell.component.html",
  styleUrl: "./gallery-cell.component.css",
  host: {
    "role": "group",
    "[attr.aria-label]": "caption()"
  }
})
export class GalleryCellComponent {
  public readonly isLong: boolean = !Object.isNull(inject(new HostAttributeToken(GalleryResources.longAttribute), { optional: true }));
  public readonly caption = input.required<string>();
}
