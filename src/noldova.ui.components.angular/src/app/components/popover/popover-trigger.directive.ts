/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { FocusMonitor } from "@angular/cdk/a11y";
import { DOCUMENT } from "@angular/common";
import { TemplatePortal } from "@angular/cdk/portal";
import {
  DestroyRef, Directive, ElementRef, Injector, type Signal, type TemplateRef, ViewContainerRef, type WritableSignal, afterNextRender, inject, input, output, signal
} from "@angular/core";

import "@noldova/context.core";

import { OverlayAlignment } from "../../enums/overlay-alignment.js";
import { PopoverOpening } from "../../enums/popover-opening.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import { ComposingKey } from "../../models/composing-key.js";
import { OverlayAnchoring } from "../../models/overlay-anchoring.js";
import { OverlaySide } from "../../models/overlay-side.js";
import { PointerGraceArea } from "../../models/pointer-grace-area.js";
import { AnchoredOverlay } from "../../services/anchored-overlay.js";
import { OverlayBoundsService } from "../../services/overlay-bounds.service.js";
import { TooltipPace } from "../../services/tooltip-pace.js";
import { DomResources } from "../../../dom-resources.js";
import { Resources } from "../../../resources.js";
import { TooltipDirectiveResources } from "../tooltip/tooltip-directive.resources.js";
import { PopoverTriggerResources } from "./popover-trigger.resources.js";

@Directive({
  selector: "[nolPopoverTrigger]",
  exportAs: "nolPopoverTrigger",
  host: {
    "aria-haspopup": "dialog",
    "[attr.aria-expanded]": "isOpen()",
    "(pointerdown)": "notePointer($event)",
    "(pointercancel)": "forgetPointer()",
    "(keydown)": "pressKey($event)",
    "(click)": "press()",
    "(pointerenter)": "enter($event)",
    "(pointerleave)": "leaveTrigger($event)",
    "(focusout)": "leaveFocus($event)"
  }
})
export class PopoverTriggerDirective {
  private readonly injector: Injector = inject(Injector);
  private readonly viewContainer: ViewContainerRef = inject(ViewContainerRef);
  private readonly bounds: OverlayBoundsService = inject(OverlayBoundsService);
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly document: Document = inject(DOCUMENT);
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly pace: TooltipPace = inject(TooltipPace);
  private readonly focus: FocusMonitor = inject(FocusMonitor);
  private readonly open: WritableSignal<boolean> = signal(false);
  private overlay: AnchoredOverlay | null = null;
  private pointerType: string = String.empty;
  private isHeldByFocus: boolean = false;
  private cancelShow: (() => void) | null = null;
  private cancelHide: (() => void) | null = null;
  private stopGrace: (() => void) | null = null;

  public readonly template = input.required<TemplateRef<unknown>>({ alias: "nolPopoverTrigger" });
  public readonly side = input<OverlaySide>(OverlaySide.above, { alias: "nolPopoverSide" });
  public readonly alignment = input<OverlayAlignment>(OverlayAlignment.End, { alias: "nolPopoverAlignment" });
  public readonly openOn = input<PopoverOpening>(PopoverOpening.Click, { alias: "nolPopoverOpenOn" });
  public readonly opened = output<void>();
  public readonly isOpen: Signal<boolean> = this.open.asReadonly();

  public constructor() {
    const subscription = this.focus.monitor(this.host).subscribe(origin => {
      if (origin === DomResources.keyboardFocusOrigin && this.opensOnHover)
        this.show(false, true);
    });
    inject(DestroyRef).onDestroy(() => {
      subscription.unsubscribe();
      this.focus.stopMonitoring(this.host);
      this.close();
    });
  }

  public toggle(): void {
    if (this.open())
      this.close();
    else
      this.show(true, false);
  }

  public close(): void {
    this.cancelPending();
    const hadFocus = this.overlay?.element.contains(document.activeElement) ?? false;
    if (this.open() && this.opensOnHover)
      this.pace.close();
    this.isHeldByFocus = false;
    this.open.set(false);
    this.overlay?.dispose();
    this.overlay = null;
    if (hadFocus)
      this.focus.focusVia(this.host, PopoverTriggerResources.returnedFocusOrigin);
  }

  protected notePointer(event: PointerEvent): void {
    this.pointerType = event.pointerType;
  }

  protected forgetPointer(): void {
    this.pointerType = String.empty;
  }

  protected pressKey(event: KeyboardEvent): void {
    const opens = event.key === Resources.spaceKey || (event.key === Resources.enterKey && !this.host.matches(PopoverTriggerResources.linkSelector));
    if (!this.opensOnHover || event.target !== this.host || !opens)
      return;
    event.preventDefault();
    this.show(true, true);
  }

  protected press(): void {
    const isTap = this.pointerType === PopoverTriggerResources.touchPointerType;
    this.pointerType = String.empty;
    if (!this.opensOnHover || isTap)
      this.toggle();
  }

  protected enter(event: PointerEvent): void {
    if (!this.opensOnHover || event.pointerType === PopoverTriggerResources.touchPointerType)
      return;
    this.cancelPending();
    if (!this.open())
      this.cancelShow = this.timeSource.after(() => this.show(false, false), this.pace.delayFor(false));
  }

  protected leaveTrigger(event: PointerEvent): void {
    if (!this.opensOnHover || event.pointerType === PopoverTriggerResources.touchPointerType)
      return;
    if (Object.isNull(this.overlay))
      this.cancelPending();
    else if (!this.isHeldByFocus)
      this.leave(event, this.overlay, true);
  }

  protected leaveFocus(event: FocusEvent): void {
    const pane = this.overlay;
    if (!this.isHeldByFocus || Object.isNull(pane))
      return;
    const target = event.relatedTarget;
    if (!(target instanceof Node && (this.host.contains(target) || pane.element.contains(target))))
      this.close();
  }

  private get opensOnHover(): boolean {
    return this.openOn() === PopoverOpening.Hover;
  }

  private show(movesFocus: boolean, byFocus: boolean): void {
    this.cancelPending();
    this.isHeldByFocus ||= byFocus;
    const overlay = this.overlay ?? this.openOverlay();
    if (movesFocus)
      afterNextRender(() => {
        if (overlay.isOpen)
          overlay.element.querySelector<HTMLElement>(`.${PopoverTriggerResources.popoverClass}`)?.focus();
      }, { injector: this.injector });
  }

  private openOverlay(): AnchoredOverlay {
    const overlay = new AnchoredOverlay(this.injector, PopoverTriggerResources.popoverPaneClass);
    overlay.outsidePointerEvents.subscribe(event => {
      if (!(event.target instanceof Node && this.host.contains(event.target)))
        this.close();
    });
    overlay.keydownEvents.subscribe(event => this.closeFromKeyboard(event, overlay.element));
    overlay.originLost.subscribe(() => this.close());
    overlay.element.addEventListener(DomResources.pointerLeaveEvent, event => {
      if (this.opensOnHover && !this.isHeldByFocus && event.pointerType !== PopoverTriggerResources.touchPointerType)
        this.leave(event, overlay, false);
    });
    overlay.element.addEventListener(PopoverTriggerResources.focusOutEvent, event => this.leaveFocus(event));
    this.overlay = overlay;
    this.open.set(true);
    overlay.openTemplate(new TemplatePortal(this.template(), this.viewContainer), this.host, new OverlayAnchoring(this.side(), this.alignment(), this.bounds.gap));
    this.opened.emit();
    return overlay;
  }

  private closeFromKeyboard(event: KeyboardEvent, pane: HTMLElement): void {
    if (event.defaultPrevented || ComposingKey.isComposing(event) || (event.key !== DomResources.escapeKey && !(event.key === Resources.tabKey && PopoverTriggerDirective.isLeaving(event, pane))))
      return;
    event.preventDefault();
    this.close();
    if (!this.opensOnHover)
      this.host.focus();
  }

  private leave(event: PointerEvent, overlay: AnchoredOverlay, isFromTrigger: boolean): void {
    const target = event.relatedTarget;
    const toward = isFromTrigger ? overlay.element : this.host;
    if (target instanceof Node && toward.contains(target))
      return;
    const boxes = overlay.placedBoxes;
    if (!(target instanceof Node) || Object.isNull(boxes)) {
      this.scheduleHide();
      return;
    }
    const [anchor, pane] = boxes;
    const point = PopoverTriggerDirective.pointOf(event);
    const area = isFromTrigger ? new PointerGraceArea(point, anchor, pane) : new PointerGraceArea(point, pane, anchor);
    if (!area.contains(point)) {
      this.scheduleHide();
      return;
    }
    this.cancelPending();
    const move = (moved: PointerEvent): void => {
      if (moved.target instanceof Node && toward.contains(moved.target))
        this.cancelPending();
      else if (!area.contains(PopoverTriggerDirective.pointOf(moved)))
        this.scheduleHide();
    };
    this.document.addEventListener(DomResources.pointermoveEvent, move, { capture: true, passive: true });
    this.stopGrace = () => this.document.removeEventListener(DomResources.pointermoveEvent, move, { capture: true });
  }

  private scheduleHide(): void {
    this.cancelPending();
    this.cancelHide = this.timeSource.after(() => this.close(), TooltipDirectiveResources.tooltipHideDelay);
  }

  private cancelPending(): void {
    this.cancelShow?.();
    this.cancelHide?.();
    this.stopGrace?.();
    this.cancelShow = null;
    this.cancelHide = null;
    this.stopGrace = null;
  }

  private static pointOf(event: PointerEvent): DOMPoint {
    return new DOMPoint(event.clientX, event.clientY);
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
