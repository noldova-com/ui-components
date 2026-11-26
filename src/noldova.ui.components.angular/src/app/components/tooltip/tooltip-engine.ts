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
import { type ComponentRef, DestroyRef, Injector, type Signal, type WritableSignal, afterNextRender, afterRenderEffect, computed, effect, inject, signal } from "@angular/core";

import "@noldova/context.core";

import { OverlayAlignment } from "../../enums/overlay-alignment.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import type { ITooltipSource } from "../../interfaces/i-tooltip-source.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import { OverlayAnchoring } from "../../models/overlay-anchoring.js";
import type { OverlaySide } from "../../models/overlay-side.js";
import { PointerGraceArea } from "../../models/pointer-grace-area.js";
import { AnchoredOverlay } from "../../services/anchored-overlay.js";
import { OverlayBoundsService } from "../../services/overlay-bounds.service.js";
import { TooltipPace } from "../../services/tooltip-pace.js";
import { DomResources } from "../../../dom-resources.js";
import { TooltipDirectiveResources } from "./tooltip-directive.resources.js";
import { TooltipComponent } from "./tooltip.component.js";

// What a tooltip directive does for its host: it shows the tooltip on hover and keyboard focus, at the shared pace, describes the host with its
// text, and hides it again. TooltipDirective builds one at once; LazyTooltipDirective imports this file once it renders, so a website's start
// holds none of the Angular CDK the tooltip needs. Built in the directive's injection context, it ends when the directive does.
export class TooltipEngine {
  private static readonly shown: WeakMap<Document, TooltipEngine> = new WeakMap();

  private readonly host: HTMLElement;
  private readonly source: ITooltipSource;
  private readonly injector: Injector = inject(Injector);
  private readonly bounds: OverlayBoundsService = inject(OverlayBoundsService);
  private readonly document: Document = inject(DOCUMENT);
  private overlay: AnchoredOverlay | null = null;
  private tooltip: ComponentRef<TooltipComponent> | null = null;
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly pace: TooltipPace = inject(TooltipPace);
  private cancelShow: (() => void) | null = null;
  private cancelHide: (() => void) | null = null;
  private stopGrace: (() => void) | null = null;
  private readonly name: WritableSignal<string> = signal(String.empty);
  private readonly isNamed: Signal<boolean>;

  public constructor(host: HTMLElement, source: ITooltipSource) {
    this.host = host;
    this.source = source;
    this.isNamed = computed(() => TooltipEngine.isSame(this.source.text(), this.name()));
    const describer = inject(AriaDescriber);
    const focus = inject(FocusMonitor);
    const dismissOnEscape = (event: KeyboardEvent): void => {
      if (event.key !== DomResources.escapeKey)
        return;
      if (this.isShown)
        event.preventDefault();
      if (!this.isShown || !(event.target instanceof Node) || !this.host.contains(event.target))
        this.hide();
    };
    this.document.addEventListener(DomResources.keydownEvent, dismissOnEscape, { capture: true });
    const subscription = focus.monitor(this.host).subscribe(origin => {
      if (origin === DomResources.keyboardFocusOrigin)
        this.show();
      else if (Object.isNull(origin))
        this.hide();
    });
    const opened = inject(Dialog).afterOpened.subscribe(() => this.hide());
    effect(() => {
      const message = this.source.text();
      this.tooltip?.setInput(TooltipDirectiveResources.tooltipTextInput, message);
    });
    effect(() => {
      const description = this.source.description();
      this.tooltip?.setInput(TooltipDirectiveResources.tooltipDescriptionInput, description);
    });
    let names: MutationObserver | null = null;
    afterNextRender(() => {
      const observer = new MutationObserver(() => this.watchName(observer));
      names = observer;
      this.watchName(observer);
    });
    afterRenderEffect(onCleanup => {
      const message = this.source.text();
      const description = this.source.description() ?? String.empty;
      this.isNamed();
      const isRead = !this.source.isTruncatedOnly() && !TooltipEngine.isSame(message, TooltipEngine.nameOf(this.host));
      const parts = [isRead ? message : String.empty, description].filter(t => t.length > 0);
      for (const part of parts)
        describer.describe(this.host, part);
      onCleanup(() => {
        for (const part of parts)
          describer.removeDescription(this.host, part);
      });
    });
    effect(() => {
      if (this.source.isDisabled())
        this.hide();
    });
    inject(DestroyRef).onDestroy(() => {
      this.document.removeEventListener(DomResources.keydownEvent, dismissOnEscape, { capture: true });
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
    TooltipEngine.shown.get(this.document)?.hide();
    TooltipEngine.shown.set(this.document, this);
    const overlay = this.overlay ?? this.createOverlay();
    const side = this.source.side();
    const anchoring = new OverlayAnchoring(side, OverlayAlignment.Center, this.bounds.gap);
    this.tooltip = overlay.openComponent(new ComponentPortal(TooltipComponent), this.host, anchoring, this.areaBeside(side));
    this.tooltip.setInput(TooltipDirectiveResources.tooltipTextInput, this.source.text());
    this.tooltip.setInput(TooltipDirectiveResources.tooltipDescriptionInput, this.source.description());
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

  public scheduleShow(): void {
    this.cancelPending();
    if (!this.declines() || !this.pace.isWaiting)
      this.cancelShow = this.pace.schedule(() => this.show(), TooltipEngine.shown.has(this.document));
  }

  public leaveAnchor(event: PointerEvent): void {
    if (Object.isNull(this.overlay) || !this.overlay.isOpen)
      this.scheduleHide();
    else
      this.leave(event, this.overlay, true);
  }

  public dismiss(event: Event): void {
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
    overlay.element.addEventListener(DomResources.pointerLeaveEvent, event => this.leave(event, overlay, false));
    overlay.detachments.subscribe(() => this.tooltip = null);
    overlay.originLost.subscribe(() => this.hide());
    this.overlay = overlay;
    return overlay;
  }

  private areaBeside(side: OverlaySide): (() => DOMRect) | null {
    const selector = this.source.besideSelector();
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
    return this.source.isDisabled() || (this.source.isTruncatedOnly() && !this.isTruncated());
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
    const point = TooltipEngine.pointOf(event);
    const area = isFromAnchor ? new PointerGraceArea(point, boxes.origin, boxes.pane) : new PointerGraceArea(point, boxes.pane, boxes.origin);
    if (!area.contains(point)) {
      this.scheduleHide();
      return;
    }
    this.cancelPending();
    const move = (moved: PointerEvent): void => {
      if (moved.target instanceof Node && toward.contains(moved.target))
        this.cancelPending();
      else if (!area.contains(TooltipEngine.pointOf(moved)))
        this.scheduleHide();
    };
    this.document.addEventListener(DomResources.pointermoveEvent, move, { capture: true, passive: true });
    this.stopGrace = () => this.document.removeEventListener(DomResources.pointermoveEvent, move, { capture: true });
  }

  private watchName(names: MutationObserver): void {
    names.disconnect();
    names.observe(this.host, TooltipDirectiveResources.tooltipNameChanges);
    for (const label of TooltipEngine.labelsOf(this.host))
      names.observe(label, TooltipDirectiveResources.tooltipNameChanges);
    this.name.set(TooltipEngine.nameOf(this.host));
  }

  private forget(): void {
    if (TooltipEngine.shown.get(this.document) === this)
      TooltipEngine.shown.delete(this.document);
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
    const ids = host.getAttribute(TooltipDirectiveResources.ariaLabelledByAttribute)?.split(DomResources.ariaIdSeparator) ?? [];
    return ids.map(id => host.ownerDocument.getElementById(id)).filter(t => t instanceof HTMLElement);
  }

  private static isSame(message: string, name: string): boolean {
    return TooltipEngine.plain(message).localeCompare(name, undefined, { sensitivity: TooltipDirectiveResources.tooltipNameSensitivity }) === 0;
  }

  private static nameOf(host: HTMLElement): string {
    const labels = TooltipEngine.labelsOf(host);
    if (labels.length > 0)
      return TooltipEngine.plain(labels.map(t => TooltipEngine.textOf(t)).join(DomResources.ariaIdSeparator));
    const label = TooltipEngine.plain(host.getAttribute(TooltipDirectiveResources.ariaLabelAttribute) ?? String.empty);
    return label.length > 0 ? label : TooltipEngine.plain(TooltipEngine.textOf(host));
  }

  private static textOf(node: Node): string {
    if (node instanceof Text)
      return node.data;
    if (node instanceof Element && node.getAttribute(DomResources.ariaHiddenAttribute) === DomResources.trueValue)
      return String.empty;
    return [...node.childNodes].map(t => TooltipEngine.textOf(t)).join(String.empty);
  }

  private static plain(text: string): string {
    return text.replace(TooltipDirectiveResources.tooltipSpacePattern, DomResources.ariaIdSeparator).trim();
  }
}
