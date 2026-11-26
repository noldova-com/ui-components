/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, computed, contentChildren, input } from "@angular/core";

import "@noldova/context.core";

import { SiteCardComponent } from "./site-card.component.js";

@Component({
  selector: "nol-site-card-grid",
  template: "<ng-content />",
  styleUrl: "./site-card-grid.component.css",
  host: {
    "class": "nol-site-card-grid",
    "[class.nol-site-card-grid-fixed]": "hasColumns()",
    "[style.--nol-site-card-grid-columns]": "columns()",
    "[style.--nol-site-card-grid-last-wide]": "wideSpan()",
    "[style.--nol-site-card-grid-last-tablet]": "tabletSpan()"
  }
})
export class SiteCardGridComponent {
  private static readonly TABLET_COLUMNS: number = 2;

  public readonly columns = input<number | null>(null);

  private readonly cards = contentChildren(SiteCardComponent);
  protected readonly hasColumns: Signal<boolean> = computed(() => !Object.isNull(this.columns()));
  // The columns the last card spans, so it fills what its row leaves: on a wide screen, and on a tablet's two columns.
  protected readonly wideSpan: Signal<number | null> = computed(() => {
    const columns = this.columns();
    return Object.isNull(columns) ? null : SiteCardGridComponent.lastSpan(this.cards().length, columns);
  });
  protected readonly tabletSpan: Signal<number | null> = computed(() =>
    Object.isNull(this.columns()) ? null : SiteCardGridComponent.lastSpan(this.cards().length, SiteCardGridComponent.TABLET_COLUMNS));

  private static lastSpan(count: number, columns: number): number {
    return columns - (Math.max(count, 1) - 1) % columns;
  }
}
