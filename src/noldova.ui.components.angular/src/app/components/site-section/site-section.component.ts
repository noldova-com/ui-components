/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { Component, computed, input } from "@angular/core";

@Component({
  selector: "nol-site-section",
  templateUrl: "./site-section.component.html",
  styleUrl: "./site-section.component.css",
  host: {
    "class": "nol-site-section"
  }
})
export class SiteSectionComponent {
  public readonly eyebrow = input<string | null>(null);
  public readonly title = input.required<string>();
  public readonly copy = input<string | null>(null);
  public readonly headingId = input.required<string>();
  public readonly sectionId = input<string | null>(null);

  // The copy's lines, which stand one under another beside the title and run together under it on a phone.
  protected readonly copyLines = computed<readonly string[]>(() => {
    const copy = this.copy();
    return Object.isNull(copy) ? [] : copy.split("\n");
  });
}
