/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AriaDescriber, FocusMonitor } from "@angular/cdk/a11y";
import { Dialog } from "@angular/cdk/dialog";
import { DOCUMENT } from "@angular/common";
import { ComponentPortal } from "@angular/cdk/portal";
import { type ComponentRef, DestroyRef, Directive, ElementRef, Injector, type Signal, type WritableSignal, afterNextRender, afterRenderEffect, computed, effect, inject, input, signal } from "@angular/core";

import "@noldova/context.core";

import { OverlayAlignment } from "../../enums/overlay-alignment.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import { OverlayAnchoring } from "../../models/overlay-anchoring.js";
import { OverlaySide } from "../../models/overlay-side.js";
import { PointerGraceArea } from "../../models/pointer-grace-area.js";
import { TooltipDefaults } from "../../models/tooltip-defaults.js";
import { AnchoredOverlay } from "../../services/anchored-overlay.js";
import { OverlayBoundsService } from "../../services/overlay-bounds.service.js";
import { TooltipPace } from "../../services/tooltip-pace.js";
import { Resources } from "../../../resources.js";
import { TooltipDirectiveResources } from "./tooltip-directive.resources.js";
import { TooltipComponent } from "./tooltip.component.js";

@Directive({
  selector: "[nolTooltip]",
  host: {
    "(pointerenter)": "scheduleShow()",
    "(pointerleave)": "leaveAnchor($event)",
    "(pointerdown)": "hide()",
    "(keydown.escape)": "dismiss($event)"
  }
})
export class TooltipDirective {
  private static readonly shown: WeakMap<Document, TooltipDirective> = new WeakMap();

  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector: Injector = inject(Injector);
  private readonly bounds: OverlayBoundsService = inject(OverlayBoundsService);
  private readonly defaults: TooltipDefaults = inject(TooltipDefaults, { self: true, optional: true }) ?? TooltipDefaults.standard;
  private readonly document: Document = inject(DOCUMENT);
  private overlay: AnchoredOverlay | null = null;
  private tooltip: ComponentRef<TooltipComponent> | null = null;
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly pace: TooltipPace = inject(TooltipPace);
  private cancelShow: (() => void) | null = null;
  private cancelHide: (() => void) | null = null;
  private stopGrace: (() => void) | null = null;
  private readonly name: WritableSignal<string> = signal(String.empty);
  private readonly isNamed: Signal<boolean> = computed(() => TooltipDirective.isSame(this.text(), this.name()));

  public readonly text = input.required<string>({ alias: "nolTooltip" });
  public readonly description = input<string | null>(null, { alias: "nolTooltipDescription" });
  public readonly side = input<OverlaySide>(this.defaults.side, { alias: "nolTooltipSide" });
  public readonly isDisabled = input<boolean>(false, { alias: "nolTooltipDisabled" });
  public readonly isTruncatedOnly = input<boolean>(this.defaults.isTruncatedOnly, { alias: "nolTooltipTruncated" });
  public readonly besideSelector = input<string | null>(null, { alias: "nolTooltipBeside" });

  public constructor() {
    const describer = inject(AriaDescriber);
    const focus = inject(FocusMonitor);
    const dismissOnEscape = (event: KeyboardEvent): void => {
      if (event.key !== Resources.escapeKey)
        return;
      if (this.isShown)
        event.preventDefault();
      if (!this.isShown || !(event.target instanceof Node) || !this.host.contains(event.target))
        this.hide();
    };
    this.document.addEventListener(Resources.keydownEvent, dismissOnEscape, { capture: true });
    const subscription = focus.monitor(this.host).subscribe(origin => {
      if (origin === Resources.keyboardFocusOrigin)
        this.show();
      else if (Object.isNull(origin))
        this.hide();
    });
    const opened = inject(Dialog).afterOpened.subscribe(() => this.hide());
    effect(() => {
      const message = this.text();
      this.tooltip?.setInput(TooltipDirectiveResources.tooltipTextInput, message);
    });
    effect(() => {
      const description = this.description();
      this.tooltip?.setInput(TooltipDirectiveResources.tooltipDescriptionInput, description);
    });
    let names: MutationObserver | null = null;
    afterNextRender(() => {
      const observer = new MutationObserver(() => this.watchName(observer));
      names = observer;
      this.watchName(observer);
    });
    afterRenderEffect(onCleanup => {
      const message = this.text();
      const description = this.description() ?? String.empty;
      this.isNamed();
      const isRead = !this.isTruncatedOnly() && !TooltipDirective.isSame(message, TooltipDirective.nameOf(this.host));
      const parts = [isRead ? message : String.empty, description].filter(t => t.length > 0);
      for (const part of parts)
        describer.describe(this.host, part);
      onCleanup(() => {
        for (const part of parts)
          describer.removeDescription(this.host, part);
      });
    });
    effect(() => {
      if (this.isDisabled())
        this.hide();
    });
    inject(DestroyRef).onDestroy(() => {
      this.document.removeEventListener(Resources.keydownEvent, dismissOnEscape, { capture: true });
      subscription.unsubscribe();
      opened.unsubscribe();
      focus.stopMonitoring(this.host);
      names?.disconnect();
      this.cancelPending();
      this.forget();
      if (this.isShown)
        this.pace.close();
      this.overlay?.dispose();
    });
  }

  public get isShown(): boolean {
    return this.overlay?.isOpen ?? false;
  }

  public show(): void {
    this.cancelPending();
    if (this.isShown || this.declines())
      return;
    this.pace.cancel();
    TooltipDirective.shown.get(this.document)?.hide();
    TooltipDirective.shown.set(this.document, this);
    const overlay = this.overlay ?? this.createOverlay();
    const side = this.side();
    const anchoring = new OverlayAnchoring(side, OverlayAlignment.Center, this.bounds.gap);
    this.tooltip = overlay.openComponent(new ComponentPortal(TooltipComponent), this.host, anchoring, this.areaBeside(side));
    this.tooltip.setInput(TooltipDirectiveResources.tooltipTextInput, this.text());
    this.tooltip.setInput(TooltipDirectiveResources.tooltipDescriptionInput, this.description());
    this.tooltip.changeDetectorRef.detectChanges();
    overlay.reposition();
  }

  public hide(): void {
    this.cancelPending();
    this.forget();
    if (this.isShown)
      this.pace.close();
    this.overlay?.close();
  }

  protected scheduleShow(): void {
    this.cancelPending();
    if (!this.declines() || !this.pace.isWaiting)
      this.cancelShow = this.pace.schedule(() => this.show(), TooltipDirective.shown.has(this.document));
  }

  protected leaveAnchor(event: PointerEvent): void {
    if (Object.isNull(this.overlay) || !this.overlay.isOpen)
      this.scheduleHide();
    else
      this.leave(event, this.overlay, true);
  }

  protected dismiss(event: Event): void {
    if (!this.isShown)
      return;
    event.preventDefault();
    event.stopPropagation();
    this.hide();
  }

  private scheduleHide(): void {
    this.cancelPending();
    this.cancelHide = this.timeSource.after(() => this.hide(), TooltipDirectiveResources.tooltipHideDelay);
  }

  private createOverlay(): AnchoredOverlay {
    const overlay = new AnchoredOverlay(this.injector, TooltipDirectiveResources.tooltipPaneClass);
    overlay.element.addEventListener(Resources.pointerLeaveEvent, event => this.leave(event, overlay, false));
    overlay.detachments.subscribe(() => this.tooltip = null);
    overlay.originLost.subscribe(() => this.hide());
    this.overlay = overlay;
    return overlay;
  }

  private areaBeside(side: OverlaySide): (() => DOMRect) | null {
    const selector = this.besideSelector();
    if (Object.isNull(selector))
      return null;
    const around = this.host.closest(selector) ?? this.host;
    return () => {
      const anchor = this.host.getBoundingClientRect();
      const edges = around.getBoundingClientRect();
      return side.isVertical ? new DOMRect(anchor.left, edges.top, anchor.width, edges.height) : new DOMRect(edges.left, anchor.top, edges.width, anchor.height);
    };
  }

  private declines(): boolean {
    return this.isDisabled() || (this.isTruncatedOnly() && !this.isTruncated());
  }

  private isTruncated(): boolean {
    const parts = [...this.host.querySelectorAll<HTMLElement>(TooltipDirectiveResources.truncationSelector)];
    return (parts.length === 0 ? [this.host] : parts).some(t => t.scrollWidth > t.clientWidth);
  }

  private leave(event: PointerEvent, overlay: AnchoredOverlay, isFromAnchor: boolean): void {
    const target = event.relatedTarget;
    const toward = isFromAnchor ? overlay.element : this.host;
    if (target instanceof Node && toward.contains(target))
      return;
    const boxes = overlay.placedBoxes;
    if (!(target instanceof Node) || Object.isNull(boxes)) {
      this.scheduleHide();
      return;
    }
    const [anchor, pane] = boxes;
    const point = TooltipDirective.pointOf(event);
    const area = isFromAnchor ? new PointerGraceArea(point, anchor, pane) : new PointerGraceArea(point, pane, anchor);
    if (!area.contains(point)) {
      this.scheduleHide();
      return;
    }
    this.cancelPending();
    const move = (moved: PointerEvent): void => {
      if (moved.target instanceof Node && toward.contains(moved.target))
        this.cancelPending();
      else if (!area.contains(TooltipDirective.pointOf(moved)))
        this.scheduleHide();
    };
    this.document.addEventListener(Resources.pointermoveEvent, move, { capture: true, passive: true });
    this.stopGrace = () => this.document.removeEventListener(Resources.pointermoveEvent, move, { capture: true });
  }

  private watchName(names: MutationObserver): void {
    names.disconnect();
    names.observe(this.host, TooltipDirectiveResources.tooltipNameChanges);
    for (const label of TooltipDirective.labelsOf(this.host))
      names.observe(label, TooltipDirectiveResources.tooltipNameChanges);
    this.name.set(TooltipDirective.nameOf(this.host));
  }

  private forget(): void {
    if (TooltipDirective.shown.get(this.document) === this)
      TooltipDirective.shown.delete(this.document);
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

  private static labelsOf(host: HTMLElement): HTMLElement[] {
    const ids = host.getAttribute(TooltipDirectiveResources.ariaLabelledByAttribute)?.split(Resources.ariaIdSeparator) ?? [];
    return ids.map(id => host.ownerDocument.getElementById(id)).filter(t => t instanceof HTMLElement);
  }

  private static isSame(message: string, name: string): boolean {
    return TooltipDirective.plain(message).localeCompare(name, undefined, { sensitivity: TooltipDirectiveResources.tooltipNameSensitivity }) === 0;
  }

  private static nameOf(host: HTMLElement): string {
    const labels = TooltipDirective.labelsOf(host);
    if (labels.length > 0)
      return TooltipDirective.plain(labels.map(t => TooltipDirective.textOf(t)).join(Resources.ariaIdSeparator));
    const label = TooltipDirective.plain(host.getAttribute(TooltipDirectiveResources.ariaLabelAttribute) ?? String.empty);
    return label.length > 0 ? label : TooltipDirective.plain(TooltipDirective.textOf(host));
  }

  private static textOf(node: Node): string {
    if (node instanceof Text)
      return node.data;
    if (node instanceof Element && node.getAttribute(Resources.ariaHiddenAttribute) === Resources.trueValue)
      return String.empty;
    return [...node.childNodes].map(t => TooltipDirective.textOf(t)).join(String.empty);
  }

  private static plain(text: string): string {
    return text.replace(TooltipDirectiveResources.tooltipSpacePattern, Resources.ariaIdSeparator).trim();
  }
}
