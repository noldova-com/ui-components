/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CdkListbox, CdkOption, type ListboxValueChangeEvent } from "@angular/cdk/listbox";
import { TemplatePortal } from "@angular/cdk/portal";
import {
  Component, DestroyRef, type ElementRef, Injector, type Signal, type TemplateRef, ViewContainerRef, type WritableSignal, afterEveryRender, computed, inject, input, output,
  signal, viewChild, viewChildren
} from "@angular/core";

import "@noldova/context.core";

import { ChipKind } from "../../enums/chip-kind.js";
import { OverlayAlignment } from "../../enums/overlay-alignment.js";
import { OverlayAnchoring } from "../../models/overlay-anchoring.js";
import { OverlaySide } from "../../models/overlay-side.js";
import { SelectGroup } from "../../models/select-group.js";
import type { SelectOption } from "../../models/select-option.js";
import { SelectSection } from "../../models/select-section.js";
import { AnchoredOverlay } from "../../services/anchored-overlay.js";
import { ChipComponent } from "../chip/chip.component.js";
import { SelectResources } from "./select.resources.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { Resources } from "../../../resources.js";

@Component({
  selector: "nol-select",
  imports: [CdkListbox, CdkOption, ChipComponent, TooltipDirective],
  templateUrl: "./select.component.html",
  styleUrl: "./select.component.css",
  host: {
    "class": "nol-select"
  }
})
export class SelectComponent {
  private static count: number = 0;

  private readonly injector: Injector = inject(Injector);
  private readonly viewContainer: ViewContainerRef = inject(ViewContainerRef);
  private readonly button: Signal<ElementRef<HTMLButtonElement>> = viewChild.required<ElementRef<HTMLButtonElement>>("button");
  private readonly optionItems: Signal<readonly CdkOption[]> = viewChildren(CdkOption);
  private readonly optionTooltips: Signal<readonly TooltipDirective[]> = viewChildren(TooltipDirective);
  private readonly labelIdPrefix: string = `${SelectResources.selectGroupLabelIdPrefix}${SelectComponent.count++}-`;
  private readonly choices: Signal<readonly SelectOption[]> = computed(() => this.options().flatMap(t => t instanceof SelectGroup ? t.options : [t]));
  private readonly chosen: Signal<SelectOption | null> = computed(() => this.choices().find(t => t.value === this.value()) ?? null);
  private overlay: AnchoredOverlay | null = null;
  private revealer: ResizeObserver | null = null;
  private followsKeys: boolean = false;
  private titledIndex: number = -1;

  protected readonly partResources: typeof SelectResources = SelectResources;
  protected readonly isOpen: WritableSignal<boolean> = signal(false);
  protected readonly optionTooltipSide: OverlaySide = OverlaySide.below;
  protected readonly tagKind: ChipKind = ChipKind.Status;

  public readonly isExpanded: Signal<boolean> = this.isOpen.asReadonly();

  public readonly options = input.required<readonly (SelectOption | SelectGroup)[]>();
  public readonly value = input.required<string>();
  public readonly label = input.required<string>();
  public readonly describedBy = input<string | null>(null);
  public readonly disabled = input<boolean>(false);
  public readonly valueChange = output<string>();

  protected readonly title: Signal<string> = computed(() => this.chosen()?.title ?? this.value());
  protected readonly name: Signal<string> = computed(() => [this.label(), this.title(), this.chosen()?.tag ?? null].filter(t => !Object.isNull(t)).join(SelectResources.selectNameSeparator));
  protected readonly marked: Signal<readonly string[]> = computed(() => Object.isNull(this.chosen()) ? [] : [this.value()]);
  protected readonly sections: Signal<readonly SelectSection[]> = computed(() => this.options().map((entry, index) => entry instanceof SelectGroup
    ? new SelectSection(entry.label, `${this.labelIdPrefix}${index}`, entry.options)
    : new SelectSection(null, null, [entry])));

  public constructor() {
    afterEveryRender(() => this.followActive());
    inject(DestroyRef).onDestroy(() => this.close());
  }

  public focus(): void {
    this.button().nativeElement.focus();
  }

  protected toggle(button: HTMLButtonElement, list: TemplateRef<unknown>): void {
    if (this.isOpen()) {
      this.close();
      return;
    }
    const overlay = new AnchoredOverlay(this.injector, Resources.dropdownPaneClass);
    overlay.outsidePointerEvents.subscribe(event => {
      if (!(event.target instanceof Node && button.contains(event.target)))
        this.close();
    });
    overlay.keydownEvents.subscribe(event => {
      if ((event.key !== Resources.escapeKey && event.key !== Resources.tabKey) || (event.key === Resources.escapeKey && event.defaultPrevented))
        return;
      event.preventDefault();
      this.closeTo(button);
    });
    overlay.originLost.subscribe(() => this.close());
    this.overlay = overlay;
    this.isOpen.set(true);
    overlay.openTemplate(new TemplatePortal(list, this.viewContainer), button, new OverlayAnchoring(OverlaySide.below, OverlayAlignment.Start, 0, 0, false));
    for (const type of [Resources.mousedownEvent, Resources.clickEvent])
      overlay.element.addEventListener(type, SelectComponent.ignoreDisabled, { capture: true });
    overlay.element.querySelector<HTMLElement>(SelectResources.listboxSelector)?.focus();
    this.revealer = new ResizeObserver(() => this.optionItems().find(t => t.isActive())?.element.scrollIntoView({ block: Resources.nearestEdge }));
    this.revealer.observe(overlay.element);
  }

  protected choose(event: ListboxValueChangeEvent<string>, button: HTMLButtonElement): void {
    this.closeTo(button);
    for (const chosen of event.value)
      this.valueChange.emit(chosen);
  }

  protected handleKey(event: KeyboardEvent, button: HTMLButtonElement): void {
    if (event.key === Resources.enterKey || event.key === Resources.spaceKey) {
      if (this.optionItems().some(t => t.isActive() && t.value === this.value()))
        this.closeTo(button);
      return;
    }
    this.followsKeys = true;
  }

  protected closeOnCurrent(value: string, button: HTMLButtonElement): void {
    if (value === this.value())
      this.closeTo(button);
  }

  private static ignoreDisabled(event: Event): void {
    if (!(event.target instanceof Element && event.target.closest(SelectResources.selectDisabledOptionSelector) !== null))
      return;
    event.preventDefault();
    event.stopPropagation();
  }

  private followActive(): void {
    if (!this.followsKeys)
      return;
    const index = this.optionItems().findIndex(t => t.isActive());
    if (index === this.titledIndex)
      return;
    this.titledIndex = index;
    this.optionTooltips().forEach((tooltip, at) => {
      if (at === index)
        tooltip.show();
      else
        tooltip.hide();
    });
  }

  private closeTo(button: HTMLButtonElement): void {
    this.close();
    button.focus();
  }

  private close(): void {
    this.isOpen.set(false);
    this.revealer?.disconnect();
    this.revealer = null;
    this.followsKeys = false;
    this.titledIndex = -1;
    this.overlay?.dispose();
    this.overlay = null;
  }
}
