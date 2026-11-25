/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DestroyRef, ElementRef, Injector, type Signal, type WritableSignal, afterNextRender, computed, inject, input, model, output, signal, viewChild } from "@angular/core";
import type { FormValueControl } from "@angular/forms/signals";

import "@noldova/context.core";

import { Resources } from "../../../resources.js";
import type { IconName } from "../../models/icon-name.js";
import { IconNames } from "../../models/icon-names.js";
import { TextFieldComponent } from "../text-field/text-field.component.js";
import { IconChooserCell } from "./icon-chooser-cell.js";
import { IconChooserResources } from "./icon-chooser.resources.js";

@Component({
  selector: "nol-icon-chooser",
  imports: [TextFieldComponent],
  templateUrl: "./icon-chooser.component.html",
  styleUrl: "./icon-chooser.component.css",
  host: {
    "class": "nol-icon-chooser",
    "(focusout)": "leave($event)"
  }
})
export class IconChooserComponent implements FormValueControl<IconName | null> {
  private static count: number = 0;

  private readonly id: string = `${IconChooserResources.iconChooserIdPrefix}${IconChooserComponent.count++}`;
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>("viewport");
  private readonly probe = viewChild.required<ElementRef<HTMLElement>>("probe");
  private readonly search = viewChild.required<string, ElementRef<HTMLInputElement>>("search", { read: ElementRef });
  private readonly width: WritableSignal<number> = signal(0);
  private readonly height: WritableSignal<number> = signal(0);
  private readonly cell: WritableSignal<number> = signal(0);
  private readonly scrollTop: WritableSignal<number> = signal(0);
  private readonly activeIndex: WritableSignal<number | null> = signal(null);
  private isStarted: boolean = false;
  private readonly destroy: DestroyRef = inject(DestroyRef);
  private readonly injector: Injector = inject(Injector);
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  public readonly label = input.required<string>();
  public readonly names = input<readonly IconName[]>(IconNames.all);
  public readonly allowNone = input<boolean>(true);
  public readonly disabled = input<boolean>(false);
  public readonly value = model<IconName | null>(null);
  public readonly touch = output<void>();

  protected readonly partResources: typeof IconChooserResources = IconChooserResources;
  protected readonly listId: string = `${this.id}${IconChooserResources.iconChooserOptionInfix}${IconChooserResources.iconChooserListSuffix}`;
  protected readonly query: WritableSignal<string> = signal(String.empty);
  protected readonly cellSize: Signal<number> = this.cell.asReadonly();
  protected readonly choices: Signal<readonly (IconName | null)[]> = computed(() => {
    const words = IconChooserComponent.wordsOf(this.query());
    const found = this.names().filter(t => words.every(u => t.includes(u)));
    return this.allowNone() ? [null, ...found] : found;
  });
  protected readonly columns: Signal<number> = computed(() => this.cell() > 0 ? Math.max(1, Math.floor(this.width() / this.cell())) : 1);
  protected readonly rowCount: Signal<number> = computed(() => Math.ceil(this.choices().length / this.columns()));
  protected readonly firstRow: Signal<number> = computed(() =>
    this.cell() > 0 ? Math.max(0, Math.floor(this.scrollTop() / this.cell()) - IconChooserResources.iconChooserOverscanRows) : 0);
  protected readonly lastRow: Signal<number> = computed(() => this.cell() > 0
    ? Math.min(this.rowCount(), Math.ceil((this.scrollTop() + this.height()) / this.cell()) + IconChooserResources.iconChooserOverscanRows)
    : Math.min(this.rowCount(), 1));
  protected readonly active: Signal<number> = computed(() => {
    const index = this.activeIndex();
    if (!Object.isNull(index) && index < this.choices().length)
      return index;
    return Math.max(0, this.choices().indexOf(this.value()));
  });
  protected readonly shown: Signal<readonly IconChooserCell[]> = computed(() => {
    const columns = this.columns();
    const firstRow = this.firstRow();
    const active = this.active();
    const first = firstRow * columns;
    const cells = this.choices().slice(first, this.lastRow() * columns).map((t, index) => new IconChooserCell(first + index, t));
    const row = Math.floor(active / columns);
    const name = this.choices()[active];
    if (Object.isUndefined(name) || (row >= firstRow && row < this.lastRow()))
      return cells;
    return [...cells, new IconChooserCell(active, name, (row - firstRow) * this.cell(), active % columns * this.cell())].sort((a, b) => a.index - b.index);
  });
  protected readonly activeId: Signal<string | null> = computed(() => this.choices().length > 0 ? this.optionId(this.active()) : null);
  protected readonly resultCount: Signal<string> = computed(() => IconChooserResources.formatResultCount(this.choices().filter(t => !Object.isNull(t)).length));

  public constructor() {
    afterNextRender(() => {
      const observer = new ResizeObserver(() => this.measure());
      observer.observe(this.viewport().nativeElement);
      this.destroy.onDestroy(() => observer.disconnect());
      this.measure();
    });
  }

  protected optionId(index: number): string {
    return `${this.id}${IconChooserResources.iconChooserOptionInfix}${index}`;
  }

  protected spoken(name: string | null): string {
    return Object.isNull(name) ? IconChooserResources.iconChooserNoneLabel
      : name.split(IconChooserResources.iconChooserNameSeparator).join(IconChooserResources.iconChooserSpokenSeparator);
  }

  protected find(text: string): void {
    this.query.set(text);
    this.activeIndex.set(null);
    this.viewport().nativeElement.scrollTop = 0;
    this.scrollTop.set(0);
  }

  protected findTyped(): void {
    this.find(this.search().nativeElement.value);
  }

  protected follow(): void {
    this.scrollTop.set(this.viewport().nativeElement.scrollTop);
  }

  protected choose(index: number): void {
    this.activeIndex.set(index);
    if (this.disabled() || index >= this.choices().length)
      return;
    this.value.set(this.choices()[index] ?? null);
  }

  protected revealOnKeyboardFocus(): void {
    if (this.viewport().nativeElement.matches(IconChooserResources.iconChooserKeyboardFocus))
      this.reveal(this.active());
  }

  protected leave(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (!(next instanceof Node && this.host.nativeElement.contains(next)))
      this.touch.emit();
  }

  protected enterGrid(event: KeyboardEvent): void {
    if (event.key !== Resources.arrowDownKey || this.choices().length === 0)
      return;
    event.preventDefault();
    this.viewport().nativeElement.focus();
  }

  protected move(event: KeyboardEvent): void {
    const count = this.choices().length;
    if (count === 0)
      return;
    const columns = this.columns();
    const page = Math.max(1, Math.floor(this.height() / Math.max(1, this.cell()))) * columns;
    const at = this.active();
    const rowStart = at - at % columns;
    let to: number | null = null;
    switch (event.key) {
      case IconChooserResources.iconChooserArrowRightKey: to = at + 1; break;
      case IconChooserResources.iconChooserArrowLeftKey: to = at - 1; break;
      case Resources.arrowDownKey: to = at + columns; break;
      case Resources.arrowUpKey: to = at - columns; break;
      case Resources.pageDownKey: to = at + page; break;
      case Resources.pageUpKey: to = at - page; break;
      case Resources.homeKey: to = event.ctrlKey ? 0 : rowStart; break;
      case Resources.endKey: to = event.ctrlKey ? count - 1 : rowStart + columns - 1; break;
      case Resources.enterKey:
      case Resources.spaceKey:
        event.preventDefault();
        this.choose(at);
        return;
      default:
        this.typeIntoSearch(event);
        return;
    }
    event.preventDefault();
    const next = Math.min(count - 1, Math.max(0, to));
    this.activeIndex.set(next);
    this.reveal(next);
  }

  private typeIntoSearch(event: KeyboardEvent): void {
    if (this.disabled() || event.ctrlKey || event.metaKey || event.altKey || !IconChooserResources.iconChooserPrintable.test(event.key))
      return;
    event.preventDefault();
    const search = this.search().nativeElement;
    search.value = `${search.value}${event.key}`;
    search.focus();
    this.find(search.value);
  }

  private reveal(index: number): void {
    const cell = this.cell();
    const viewport = this.viewport().nativeElement;
    const top = Math.floor(index / this.columns()) * cell;
    if (top < viewport.scrollTop)
      viewport.scrollTop = top;
    else if (top + cell > viewport.scrollTop + viewport.clientHeight)
      viewport.scrollTop = top + cell - viewport.clientHeight;
    this.scrollTop.set(viewport.scrollTop);
  }

  private measure(): void {
    const viewport = this.viewport().nativeElement;
    this.width.set(viewport.clientWidth);
    this.height.set(viewport.clientHeight);
    this.cell.set(this.probe().nativeElement.getBoundingClientRect().height);
    if (this.isStarted || this.cell() <= 0)
      return;
    this.isStarted = true;
    afterNextRender(() => this.reveal(this.active()), { injector: this.injector });
  }

  private static wordsOf(query: string): readonly string[] {
    return query.trim().toLowerCase().split(IconChooserResources.iconChooserWordSeparator).filter(t => t.length > 0);
  }
}
