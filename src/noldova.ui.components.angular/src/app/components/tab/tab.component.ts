/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ElementRef, type Signal, ViewEncapsulation, type WritableSignal, afterRenderEffect, computed, inject, input, linkedSignal, output, untracked,
  viewChild } from "@angular/core";

import type { TabMarker } from "../../models/tab-marker.js";
import type { TabStatus } from "../../models/tab-status.js";
import { TooltipDefaults } from "../../models/tooltip-defaults.js";
import { Resources } from "../../../resources.js";
import { SpinnerComponent } from "../spinner/spinner.component.js";
import { TabResources } from "./tab.resources.js";
import { TextFieldComponent } from "../text-field/text-field.component.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { ViewBadgeComponent } from "../view-badge/view-badge.component.js";

@Component({
  selector: "nol-tab",
  imports: [SpinnerComponent, TextFieldComponent, TooltipDirective, ViewBadgeComponent],
  templateUrl: "./tab.component.html",
  styleUrl: "./tab.component.css",
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: TooltipDefaults, useValue: TabResources.tabTooltip }],
  hostDirectives: [{ directive: TooltipDirective, inputs: ["nolTooltip: label"] }],
  host: {
    "class": "nol-tab",
    "role": "tab",
    "[attr.aria-label]": "accessibleName()",
    "[attr.aria-selected]": "selected()",
    "[attr.aria-busy]": "working() && !waiting() || null",
    "[attr.aria-description]": "preview() ? partResources.previewDescription : null",
    "[attr.tabindex]": "selected() ? 0 : -1",
    "[class.nol-tab-selected]": "selected()",
    "[class.nol-tab-preview]": "preview()",
    "[class.nol-tab-working]": "working() && !hasLeadingSpinner()",
    "[class.nol-tab-underlined]": "underline() !== null",
    "[class.nol-tab-waiting]": "waiting()",
    "[class.nol-tab-editing]": "editing()",
    "(click)": "activate.emit()",
    "(keydown.enter)": "activate.emit()",
    "(keydown.space)": "onSpace($event)",
    "(keydown.delete)": "requestClose()",
    "(mousedown)": "onMouseDown($event)",
    "(auxclick)": "onAuxiliaryClick($event)"
  }
})
export class TabComponent {
  protected readonly resources: typeof Resources = Resources;
  protected readonly partResources: typeof TabResources = TabResources;
  protected readonly closeLabel: Signal<string> = computed(() => Resources.formatCloseTab(this.label()));
  protected readonly accessibleName: Signal<string> = computed(() => [this.status()?.description, this.marker()?.label, this.underline(), this.badge(),
    this.waiting() ? TabResources.tabWaitingDescription : null].reduce<string>((name, part) => Object.isNullOrUndefined(part) ? name : TabResources.formatBadged(name, part), this.label()));
  protected readonly hasLeadingSpinner: Signal<boolean> = computed(() => this.leadingSpinner() && this.working() && !this.waiting());
  protected readonly hasImage: Signal<boolean> = computed(() => !Object.isNull(this.image()) || !Object.isNull(this.imageGlyph()));
  protected readonly shownImageGlyph: Signal<string | null> = computed(() => this.imageGlyph() ?? (Object.isNull(this.image()) ? null : TabResources.tabImageGlyph));
  protected readonly isImageLoaded: WritableSignal<boolean> = linkedSignal({ source: () => this.image(), computation: () => false });

  public readonly label = input.required<string>();
  public readonly icon = input<string>();
  public readonly selected = input<boolean>(false);
  public readonly preview = input<boolean>(false);
  public readonly working = input<boolean>(false);
  public readonly waiting = input<boolean>(false);
  public readonly closable = input<boolean>(true);
  public readonly badge = input<string | null>(null);
  public readonly badgeCount = input<number | null>(null);
  public readonly image = input<string | null>(null);
  public readonly imageGlyph = input<string | null>(null);
  public readonly status = input<TabStatus | null>(null);
  public readonly leadingSpinner = input<boolean>(false);
  public readonly marker = input<TabMarker | null>(null);
  public readonly underline = input<string | null>(null);
  public readonly editing = input<boolean>(false);
  public readonly activate = output<void>();
  public readonly close = output<void>();
  public readonly labelKept = output<string>();
  public readonly labelCancelled = output<void>();

  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly fieldElement: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild("field", { read: ElementRef });
  private isSettled: boolean = false;
  private hadField: boolean = false;

  public constructor() {
    afterRenderEffect(() => {
      const field = this.fieldElement()?.nativeElement;
      const hadField = this.hadField;
      this.hadField = !Object.isUndefined(field);
      if (Object.isUndefined(field)) {
        if (hadField && (Object.isNull(document.activeElement) || document.activeElement === document.body))
          this.host.focus();
        return;
      }
      this.isSettled = false;
      field.value = untracked(this.label);
      field.focus();
      field.select();
    });
  }

  protected onSpace(event: Event): void {
    event.preventDefault();
    this.activate.emit();
  }

  protected onMouseDown(event: MouseEvent): void {
    if (event.button === Resources.middleButton)
      event.preventDefault();
  }

  protected onAuxiliaryClick(event: MouseEvent): void {
    if (event.button !== Resources.middleButton)
      return;
    event.preventDefault();
    this.requestClose();
  }

  protected onCloseClick(event: MouseEvent): void {
    event.stopPropagation();
    this.requestClose();
  }

  protected onFieldKeyDown(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.isComposing)
      return;
    if (event.key === Resources.enterKey) {
      event.preventDefault();
      this.keep();
    }
    else if (event.key === Resources.escapeKey) {
      event.preventDefault();
      this.settle(() => this.labelCancelled.emit());
    }
  }

  protected keep(): void {
    const field = this.fieldElement()?.nativeElement;
    if (this.editing() && !Object.isUndefined(field))
      this.settle(() => this.labelKept.emit(field.value.trim()));
  }

  protected requestClose(): void {
    if (this.closable())
      this.close.emit();
  }

  private settle(report: () => void): void {
    if (this.isSettled)
      return;
    this.isSettled = true;
    report();
  }
}
