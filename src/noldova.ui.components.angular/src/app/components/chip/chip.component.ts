/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DestroyRef, ElementRef, type Signal, type WritableSignal, afterEveryRender, afterNextRender, computed, inject, input, signal, viewChild } from "@angular/core";

import "@noldova/context.core";

import { ChipKind } from "../../enums/chip-kind.js";
import { ChipResources } from "./chip.resources.js";
import { TooltipDirective } from "../tooltip/tooltip.directive.js";
import { Resources } from "../../../resources.js";

@Component({
  selector: "nol-chip",
  imports: [TooltipDirective],
  templateUrl: "./chip.component.html",
  styleUrl: "./chip.component.css",
  host: {
    "class": "nol-chip",
    "[class.nol-chip-count]": "kind() === kinds.Count",
    "[class.nol-chip-added]": "kind() === kinds.Added",
    "[class.nol-chip-removed]": "kind() === kinds.Removed",
    "[class.nol-chip-key]": "kind() === kinds.Key",
    "[class.nol-chip-status]": "kind() === kinds.Status || kind() === kinds.Failed || kind() === kinds.Warning || kind() === kinds.On",
    "[class.nol-chip-failed]": "kind() === kinds.Failed",
    "[class.nol-chip-warning]": "kind() === kinds.Warning",
    "[class.nol-chip-on]": "kind() === kinds.On"
  }
})
export class ChipComponent {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef: DestroyRef = inject(DestroyRef);
  private readonly label: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("label");
  private readonly tooltip: Signal<TooltipDirective> = viewChild.required(TooltipDirective);

  protected readonly kinds: typeof ChipKind = ChipKind;
  protected readonly fullText: WritableSignal<string> = signal(String.empty);
  protected readonly text: Signal<string> = computed(() => {
    const count = this.count();
    switch (this.kind()) {
      case ChipKind.Added:
        return `${ChipResources.chipAddedSign}${count}`;
      case ChipKind.Removed:
        return `${ChipResources.chipRemovedSign}${count}`;
      case ChipKind.Key:
      case ChipKind.Status:
      case ChipKind.Failed:
      case ChipKind.Warning:
      case ChipKind.On:
        return String.empty;
      default:
        return Resources.formatBadgeCount(count);
    }
  });

  public readonly kind = input<ChipKind>(ChipKind.Count);
  public readonly count = input<number>(0);

  public constructor() {
    afterEveryRender({ read: () => this.fullText.set(this.label().nativeElement.textContent.trim()) });
    afterNextRender(() => this.followOwnerFocus());
  }

  private followOwnerFocus(): void {
    const owner = this.host.closest<HTMLElement>(Resources.focusableSelector);
    if (Object.isNull(owner))
      return;
    const show = (): void => {
      if (owner.matches(ChipResources.focusVisibleSelector))
        this.tooltip().show();
    };
    const hide = (): void => this.tooltip().hide();
    owner.addEventListener(ChipResources.focusEvent, show);
    owner.addEventListener(Resources.blurEvent, hide);
    this.destroyRef.onDestroy(() => {
      owner.removeEventListener(ChipResources.focusEvent, show);
      owner.removeEventListener(Resources.blurEvent, hide);
    });
  }
}
