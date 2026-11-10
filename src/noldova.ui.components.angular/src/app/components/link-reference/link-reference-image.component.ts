/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, input } from "@angular/core";

import type { LinkReferenceImage } from "../../models/link-reference-image.js";
import { LinkReferenceImageComponentResources } from "./link-reference-image-component.resources.js";

@Component({
  selector: "nol-link-reference-image",
  template: `@if (!image().isMonochrome) {<img class="nol-link-reference-image-picture" [src]="image().url" alt="">}`,
  styleUrl: "./link-reference-image.component.css",
  host: {
    "class": "nol-link-reference-image",
    "aria-hidden": "true",
    "[class.nol-link-reference-image-monochrome]": "image().isMonochrome",
    "[style.--nol-link-reference-image]": "mask()"
  }
})
export class LinkReferenceImageComponent {
  protected readonly mask: Signal<string | null> = computed(() => this.image().isMonochrome ? LinkReferenceImageComponentResources.formatLinkReferenceImage(this.image().url) : null);

  public readonly image = input.required<LinkReferenceImage>();
}
