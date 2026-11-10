/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  Component, ElementRef, Injector, type Signal, type WritableSignal, afterEveryRender, afterNextRender, afterRenderEffect, computed, inject, input, linkedSignal,
  model, output, viewChild, viewChildren
} from "@angular/core";

import "@noldova/context.core";

import { OverlaySide } from "../../models/overlay-side.js";
import { QuickInputGroup } from "../../models/quick-input-group.js";
import type { QuickInputItem } from "../../models/quick-input-item.js";
import { QuickInputResources } from "./quick-input.resources.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { Resources } from "../../../resources.js";

@Component({
  selector: "nol-quick-input",
  imports: [TooltipDirective],
  templateUrl: "./quick-input.component.html",
  styleUrl: "./quick-input.component.css",
  host: {
    "[class.nol-quick-input-has-icon]": "icon() !== null"
  }
})
export class QuickInputComponent {
  private static count: number = 0;

  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector: Injector = inject(Injector);
  private readonly list: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("list");
  private readonly optionTooltips: Signal<readonly TooltipDirective[]> = viewChildren(TooltipDirective);
  private readonly movedId: WritableSignal<string | null> = linkedSignal({
    source: () => ({ items: this.items(), query: this.query() }),
    computation: (source, previous?: { readonly source: { readonly items: readonly QuickInputItem[]; readonly query: string }; readonly value: string | null }) =>
      !Object.isUndefined(previous) && previous.source.query === source.query && source.items.some(t => t.id === previous.value) ? previous.value : null
  });
  private shownQuery: string = String.empty;
  private isChoosing: boolean = false;
  private followsKeys: boolean = false;
  private titled: TooltipDirective | null = null;

  protected readonly partResources: typeof QuickInputResources = QuickInputResources;
  protected readonly tooltipSide: OverlaySide = OverlaySide.below;
  protected readonly listId: string = `${QuickInputResources.quickInputIdPrefix}${QuickInputComponent.count++}`;
  protected readonly active: Signal<number> = computed(() => {
    const id = this.movedId();
    return Math.max(0, this.items().findIndex(t => t.id === id));
  });
  protected readonly groups: Signal<readonly QuickInputGroup[]> = computed(() => {
    const items = this.items();
    const starts = items.flatMap((item, index) => index === 0 || !Object.isNull(item.section) ? [index] : []);
    return starts.map((start, index) => new QuickInputGroup(items[start]?.section ?? null, start, items.slice(start, starts[index + 1])));
  });
  protected readonly activeId: Signal<string | null> = computed(() => this.items().length === 0 ? null : this.optionId(this.active()));
  protected readonly isEmptyShown: Signal<boolean> = computed(() => this.items().length === 0 && this.emptyText() !== String.empty);
  protected readonly status: Signal<string> = computed(() => {
    if (!this.isEmptyShown())
      return QuickInputResources.formatResultCount(this.items().length);
    return this.isEmptyTextAlert() ? String.empty : this.emptyText();
  });
  protected readonly alert: Signal<string> = computed(() => this.isEmptyShown() && this.isEmptyTextAlert() ? this.emptyText() : String.empty);

  public readonly items = input.required<readonly QuickInputItem[]>();
  public readonly label = input.required<string>();
  public readonly icon = input<string | null>(null);
  public readonly emptyText = input<string>(String.empty);
  public readonly isEmptyTextAlert = input<boolean>(false);
  public readonly query = model<string>(String.empty);
  public readonly isFocusing = input<boolean>(true);
  public readonly chosen = output<QuickInputItem>();
  public readonly dismissed = output<void>();
  public readonly tabKey = output<KeyboardEvent>();

  public constructor() {
    afterRenderEffect(() => {
      this.shownQuery = this.query();
    });
    afterRenderEffect(() => {
      const list = this.list().nativeElement;
      const row = list.querySelector<HTMLElement>(`#${this.optionId(this.active())}`);
      if (!Object.isNull(row))
        QuickInputComponent.reveal(list, row, list.querySelector<HTMLElement>(`#${this.headingId(this.active())}`) ?? row);
    });
    afterEveryRender(() => this.followActive());
    afterNextRender(() => {
      if (this.isFocusing())
        this.host.querySelector<HTMLInputElement>(QuickInputResources.quickInputFieldSelector)?.focus();
    });
  }

  protected optionId(index: number): string {
    return `${this.listId}${QuickInputResources.quickInputOptionSeparator}${index}`;
  }

  protected headingId(start: number): string {
    return `${this.listId}${QuickInputResources.quickInputHeadingSeparator}${start}`;
  }

  protected tooltipOf(item: QuickInputItem): string {
    return Resources.formatJoinedTooltip(item.title, item.detail);
  }

  protected onKey(event: KeyboardEvent): void {
    const next = QuickInputComponent.isModified(event) ? null : this.indexFor(event.key);
    if (!Object.isNull(next)) {
      event.preventDefault();
      this.follow();
      this.movedId.set(this.items()[Math.max(0, Math.min(next, this.items().length - 1))]?.id ?? null);
      return;
    }
    if (event.key === Resources.enterKey) {
      event.preventDefault();
      this.chooseActive();
    }
    else if (event.key === Resources.escapeKey && !event.defaultPrevented) {
      event.preventDefault();
      this.dismissed.emit();
    }
    else if (event.key === Resources.tabKey && !event.ctrlKey && !event.altKey && !event.metaKey)
      this.tabKey.emit(event);
  }

  protected onInput(text: string): void {
    this.follow();
    this.query.set(text);
  }

  protected stopFollowing(): void {
    this.followsKeys = false;
    this.titled = null;
    for (const tooltip of this.optionTooltips())
      tooltip.hide();
  }

  protected choose(index: number): void {
    const item = this.items()[index];
    if (!Object.isUndefined(item))
      this.chosen.emit(item);
  }

  private chooseActive(): void {
    if (this.query() === this.shownQuery)
      this.choose(this.active());
    else if (!this.isChoosing) {
      this.isChoosing = true;
      afterNextRender(() => {
        this.isChoosing = false;
        this.choose(this.active());
      }, { injector: this.injector });
    }
  }

  private follow(): void {
    this.followsKeys = true;
    this.titled = null;
  }

  private followActive(): void {
    const tooltip = this.followsKeys ? this.optionTooltips()[this.active()] ?? null : null;
    if (tooltip === this.titled)
      return;
    this.titled = tooltip;
    for (const each of this.optionTooltips()) {
      if (each === tooltip)
        each.show();
      else
        each.hide();
    }
  }

  private indexFor(key: string): number | null {
    const active = this.active();
    switch (key) {
      case Resources.arrowDownKey:
        return active + 1;
      case Resources.arrowUpKey:
        return active - 1;
      case Resources.homeKey:
        return 0;
      case Resources.endKey:
        return this.items().length - 1;
      case Resources.pageDownKey:
        return active + this.pageSize();
      case Resources.pageUpKey:
        return active - this.pageSize();
      default:
        return null;
    }
  }

  private pageSize(): number {
    const list = this.list().nativeElement;
    const row = list.querySelector<HTMLElement>(QuickInputResources.quickInputOptionSelector);
    return Object.isNull(row) ? 1 : Math.max(1, Math.floor(QuickInputComponent.viewHeight(list) / row.getBoundingClientRect().height));
  }

  private static isModified(event: KeyboardEvent): boolean {
    return event.shiftKey || event.ctrlKey || event.altKey || event.metaKey;
  }

  private static reveal(list: HTMLElement, row: HTMLElement, from: HTMLElement): void {
    const origin = list.getBoundingClientRect().top + list.clientTop - list.scrollTop;
    const top = from.getBoundingClientRect().top - origin;
    const bottom = row.getBoundingClientRect().bottom - origin;
    if (top < list.scrollTop)
      list.scrollTop = top;
    else if (bottom > list.scrollTop + QuickInputComponent.viewHeight(list))
      list.scrollTop = bottom - QuickInputComponent.viewHeight(list);
  }

  private static viewHeight(list: HTMLElement): number {
    return list.clientHeight - Number.parseFloat(getComputedStyle(list).paddingBottom);
  }
}
