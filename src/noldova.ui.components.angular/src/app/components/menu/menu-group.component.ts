/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CdkMenuItem } from "@angular/cdk/menu";
import { Component, ElementRef, afterRenderEffect, contentChildren, input, viewChild } from "@angular/core";

import "@noldova/context.core";

import { MenuGroupResources } from "./menu-group.resources.js";

@Component({
  selector: "nol-menu-group",
  templateUrl: "./menu-group.component.html",
  styleUrl: "./menu-group.component.css",
  host: {
    "role": "group",
    "[attr.aria-labelledby]": "labelId"
  }
})
export class MenuGroupComponent {
  private static count: number = 0;

  private readonly rows = viewChild.required<ElementRef<HTMLElement>>("rows");
  private readonly items = contentChildren<CdkMenuItem, ElementRef<HTMLElement>>(CdkMenuItem, { read: ElementRef });
  private settled: number = 0;

  protected readonly labelId: string = `${MenuGroupResources.menuGroupLabelIdPrefix}${MenuGroupComponent.count++}`;

  public readonly label = input.required<string>();
  public readonly maxRows = input<number | null>(null);

  public constructor() {
    afterRenderEffect(onCleanup => {
      const rows = this.rows().nativeElement;
      const maxRows = this.maxRows();
      const items = this.items().map(t => t.nativeElement).filter(t => rows.contains(t));
      if (Object.isNull(maxRows) || items.length <= maxRows)
        return;
      const shown = items.slice(0, Math.max(maxRows, 1));
      const last = shown[shown.length - 1] as HTMLElement;
      rows.classList.add(MenuGroupResources.menuGroupScrollsClass);
      const fit = (): void => {
        rows.style.maxHeight = `${last.getBoundingClientRect().bottom - rows.getBoundingClientRect().top + rows.scrollTop}px`;
      };
      fit();
      this.showCurrent(rows, items);
      let frame: number | null = null;
      const observer = new ResizeObserver(() => frame ??= requestAnimationFrame(() => {
        frame = null;
        fit();
      }));
      for (const item of shown)
        observer.observe(item);
      onCleanup(() => {
        if (!Object.isNull(frame))
          cancelAnimationFrame(frame);
        observer.disconnect();
        rows.classList.remove(MenuGroupResources.menuGroupScrollsClass);
        rows.style.maxHeight = String.empty;
      });
    });
  }

  private showCurrent(rows: HTMLElement, items: readonly HTMLElement[]): void {
    const current = items.find(t => t === rows.ownerDocument.activeElement) ?? items.find(t => t.matches(MenuGroupResources.menuCheckedItemSelector));
    if (Object.isUndefined(current))
      return;
    const item = current.getBoundingClientRect();
    const top = item.top - rows.getBoundingClientRect().top + rows.scrollTop;
    rows.scrollTop = Math.min(Math.max(rows.scrollTop, top + item.height - rows.clientHeight), top);
    this.settled = rows.scrollTop;
  }

  protected settle(): void {
    this.settled = this.rows().nativeElement.scrollTop;
  }

  protected reveal(event: FocusEvent): void {
    const rows = this.rows().nativeElement;
    if (rows.scrollHeight <= rows.clientHeight)
      return;
    const item = (event.target as Element).getBoundingClientRect();
    const top = item.top - rows.getBoundingClientRect().top + rows.scrollTop;
    rows.scrollTop = Math.min(Math.max(this.settled, top + item.height - rows.clientHeight), top);
    this.settled = rows.scrollTop;
  }
}
