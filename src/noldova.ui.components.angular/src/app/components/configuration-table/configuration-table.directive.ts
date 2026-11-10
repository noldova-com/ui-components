/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DestroyRef, Directive, ElementRef, type Signal, afterNextRender, computed, inject } from "@angular/core";

import "@noldova/context.core";

import { ConfigurationTableFillWidths } from "../../models/configuration-table-fill-widths.js";
import { ConfigurationTableShares } from "../../models/configuration-table-shares.js";
import { ConfigurationTableTokens } from "../../models/configuration-table-tokens.js";
import type { IScrollbarGutters } from "../../interfaces/i-scrollbar-gutters.js";
import { ConfigurationTableDirectiveResources } from "./configuration-table-directive.resources.js";
import { ConfigurationTableComponent } from "./configuration-table.component.js";

@Directive({
  selector: "table[nolConfigurationTable]",
  providers: [ConfigurationTableShares, ConfigurationTableFillWidths],
  host: {
    "class": "nol-configuration-table-grid",
    "[attr.aria-label]": "name()",
    "[class.nol-configuration-table-shared]": "isShared()",
    "[class.nol-configuration-table-fill-anywhere]": "fillWidths.breaksAnywhere()",
    "[style.--nol-configuration-table-fill-min-width]": "fillMinWidth()"
  }
})
export class ConfigurationTableDirective {
  private readonly owner: ConfigurationTableComponent = inject(ConfigurationTableComponent);
  private readonly shares: ConfigurationTableShares = inject(ConfigurationTableShares, { self: true });
  protected readonly fillWidths: ConfigurationTableFillWidths = inject(ConfigurationTableFillWidths, { self: true });
  private readonly grid: HTMLTableElement = inject<ElementRef<HTMLTableElement>>(ElementRef).nativeElement;
  private readonly gutters: IScrollbarGutters = inject(ConfigurationTableTokens.scrollbarGutters);
  private lastWrap: { readonly room: number; readonly width: number; readonly gutters: number } | null = null;
  private lastMiss: { readonly room: number; readonly width: number; readonly hold: number } | null = null;

  protected readonly name: Signal<string | null> = computed(() => [this.owner.heading(), this.owner.label()].find(t => !String.isNullOrEmpty(t)) ?? null);
  protected readonly isShared: Signal<boolean> = computed(() => this.shares.total() > 0);
  protected readonly fillMinWidth: Signal<string | null> = computed(() => {
    const minimum = this.fillWidths.minimum();
    return Object.isNull(minimum) ? null : ConfigurationTableDirectiveResources.formatConfigurationTableFillMinWidth(minimum);
  });

  public constructor() {
    let fitAfterObservedFrame: number | null = null;
    const sizes = new ResizeObserver(() => fitAfterObservedFrame ??= requestAnimationFrame(() => {
      fitAfterObservedFrame = null;
      this.fit();
    }));
    afterNextRender(() => {
      for (const part of [this.grid.closest<HTMLElement>(ConfigurationTableDirectiveResources.configurationTableSelector), this.grid].filter((t): t is HTMLElement => !Object.isNull(t)))
        sizes.observe(part);
    });
    inject(DestroyRef).onDestroy(() => {
      if (!Object.isNull(fitAfterObservedFrame))
        cancelAnimationFrame(fitAfterObservedFrame);
      sizes.disconnect();
    });
  }

  private fit(): void {
    const table = this.grid.closest<HTMLElement>(ConfigurationTableDirectiveResources.configurationTableSelector);
    this.grid.classList.remove(...ConfigurationTableDirectiveResources.configurationTableNarrowClasses);
    if (Object.isNull(table) || this.isShared())
      return;
    const room = table.clientWidth;
    const width = this.grid.offsetWidth;
    const isHeld = !Object.isNull(this.lastMiss) && this.lastMiss.width === width && room <= this.lastMiss.room + this.lastMiss.hold;
    if (width <= room || isHeld)
      return;
    const narrowers = this.fillWidths.breaksAnywhere() ? ConfigurationTableDirectiveResources.configurationTableNarrowClasses : ConfigurationTableDirectiveResources.configurationTableNarrowClasses.slice(0, 1);
    for (const narrower of narrowers) {
      this.grid.classList.add(narrower);
      if (this.grid.offsetWidth <= room) {
        this.lastMiss = null;
        this.lastWrap = { room, width, gutters: this.gutters.across(table) };
        return;
      }
    }
    this.grid.classList.remove(...ConfigurationTableDirectiveResources.configurationTableNarrowClasses);
    const rem = Number.parseFloat(getComputedStyle(this.grid.ownerDocument.documentElement).fontSize);
    const wrap = this.lastWrap;
    const gutter = wrap?.width === width ? Math.min(wrap.room - room, this.gutters.across(table) - wrap.gutters) : 0;
    this.lastMiss = { room, width, hold: Math.max(ConfigurationTableDirectiveResources.configurationTableRefitRoom * rem, gutter) };
  }
}
