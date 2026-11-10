/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TemplatePortal } from "@angular/cdk/portal";
import {
  DestroyRef, Directive, ElementRef, Injector, type Signal, type TemplateRef, ViewContainerRef, type WritableSignal, afterNextRender, inject, input, output, signal
} from "@angular/core";

import "@noldova/context.core";

import { OverlayAlignment } from "../../enums/overlay-alignment.js";
import { OverlayAnchoring } from "../../models/overlay-anchoring.js";
import { OverlaySide } from "../../models/overlay-side.js";
import { AnchoredOverlay } from "../../services/anchored-overlay.js";
import { OverlayBoundsService } from "../../services/overlay-bounds.service.js";
import { Resources } from "../../../resources.js";
import { PopoverTriggerResources } from "./popover-trigger.resources.js";

@Directive({
  selector: "[nolPopoverTrigger]",
  exportAs: "nolPopoverTrigger",
  host: {
    "aria-haspopup": "dialog",
    "[attr.aria-expanded]": "isOpen()",
    "(click)": "toggle()"
  }
})
export class PopoverTriggerDirective {
  private readonly injector: Injector = inject(Injector);
  private readonly viewContainer: ViewContainerRef = inject(ViewContainerRef);
  private readonly bounds: OverlayBoundsService = inject(OverlayBoundsService);
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly open: WritableSignal<boolean> = signal(false);
  private overlay: AnchoredOverlay | null = null;

  public readonly template = input.required<TemplateRef<unknown>>({ alias: "nolPopoverTrigger" });
  public readonly side = input<OverlaySide>(OverlaySide.above, { alias: "nolPopoverSide" });
  public readonly alignment = input<OverlayAlignment>(OverlayAlignment.End, { alias: "nolPopoverAlignment" });
  public readonly opened = output<void>();
  public readonly isOpen: Signal<boolean> = this.open.asReadonly();

  public constructor() {
    inject(DestroyRef).onDestroy(() => this.close());
  }

  public toggle(): void {
    if (this.open())
      this.close();
    else
      this.show();
  }

  public close(): void {
    const hadFocus = this.overlay?.element.contains(document.activeElement) ?? false;
    this.open.set(false);
    this.overlay?.dispose();
    this.overlay = null;
    if (hadFocus)
      this.host.focus();
  }

  private show(): void {
    const overlay = new AnchoredOverlay(this.injector, PopoverTriggerResources.popoverPaneClass);
    overlay.outsidePointerEvents.subscribe(event => {
      if (!(event.target instanceof Node && this.host.contains(event.target)))
        this.close();
    });
    overlay.keydownEvents.subscribe(event => this.closeFromKeyboard(event, overlay.element));
    overlay.originLost.subscribe(() => this.close());
    this.overlay = overlay;
    this.open.set(true);
    overlay.openTemplate(new TemplatePortal(this.template(), this.viewContainer), this.host, new OverlayAnchoring(this.side(), this.alignment(), this.bounds.gap));
    afterNextRender(() => {
      if (overlay.isOpen)
        overlay.element.querySelector<HTMLElement>(`.${PopoverTriggerResources.popoverClass}`)?.focus();
    }, { injector: this.injector });
    this.opened.emit();
  }

  private closeFromKeyboard(event: KeyboardEvent, pane: HTMLElement): void {
    if (event.defaultPrevented || (event.key !== Resources.escapeKey && !(event.key === Resources.tabKey && PopoverTriggerDirective.isLeaving(event, pane))))
      return;
    event.preventDefault();
    this.close();
    this.host.focus();
  }

  private static isLeaving(event: KeyboardEvent, pane: HTMLElement): boolean {
    const focused = pane.querySelector(":focus");
    if (Object.isNull(focused))
      return false;
    const toward = event.shiftKey ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING;
    return ![...pane.querySelectorAll<HTMLElement>(Resources.focusableSelector)]
      .some(t => t.tabIndex >= 0 && !t.matches(":disabled") && t.checkVisibility({ visibilityProperty: true }) && (focused.compareDocumentPosition(t) & toward) !== 0);
  }
}
