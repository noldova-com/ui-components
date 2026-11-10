/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { FocusMonitor } from "@angular/cdk/a11y";
import { DOCUMENT } from "@angular/common";
import { ComponentPortal } from "@angular/cdk/portal";
import { type ComponentRef, Component, DestroyRef, ElementRef, Injector, type Signal, computed, effect, inject, input, output } from "@angular/core";

import "@noldova/context.core";

import { OverlayAlignment } from "../../enums/overlay-alignment.js";
import type { ITimeSource } from "../../interfaces/i-time-source.js";
import { ClockTokens } from "../../models/clock-tokens.js";
import type { LinkMenuEvent } from "../../models/link-menu-event.js";
import type { LinkOpenEvent } from "../../models/link-open-event.js";
import type { LinkReference } from "../../models/link-reference.js";
import type { LinkReferenceState } from "../../models/link-reference-state.js";
import { OverlayAnchoring } from "../../models/overlay-anchoring.js";
import { OverlaySide } from "../../models/overlay-side.js";
import { PointerGraceArea } from "../../models/pointer-grace-area.js";
import { TooltipTokens } from "../../models/tooltip-tokens.js";
import { AnchoredOverlay } from "../../services/anchored-overlay.js";
import { OverlayBoundsService } from "../../services/overlay-bounds.service.js";
import { Resources } from "../../../resources.js";
import { LinkReferenceCardComponent } from "./link-reference-card.component.js";
import { LinkReferenceChipResources } from "./link-reference-chip.resources.js";
import { LinkReferenceImageComponent } from "./link-reference-image.component.js";

@Component({
  selector: "a[nol-link-reference-chip]",
  imports: [LinkReferenceImageComponent],
  templateUrl: "./link-reference-chip.component.html",
  styleUrl: "./link-reference-chip.component.css",
  host: {
    "class": "nol-link-reference-chip",
    "[style.--nol-link-reference-state]": "stateColor()",
    "(pointerenter)": "scheduleShow()",
    "(pointerleave)": "leaveChip($event)",
    "(pointerdown)": "hide()",
    "(focusout)": "leaveFocus($event)",
    "(keydown)": "enterCard($event)"
  }
})
export class LinkReferenceChipComponent {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector: Injector = inject(Injector);
  private readonly bounds: OverlayBoundsService = inject(OverlayBoundsService);
  private readonly document: Document = inject(DOCUMENT);
  private readonly timeSource: ITimeSource = inject(ClockTokens.timeSource);
  private readonly restDelay: number = inject(TooltipTokens.restDelay);
  private overlay: AnchoredOverlay | null = null;
  private card: ComponentRef<LinkReferenceCardComponent> | null = null;
  private cancelShow: (() => void) | null = null;
  private stopGrace: (() => void) | null = null;
  private readonly focus: FocusMonitor = inject(FocusMonitor);

  protected readonly stateColor: Signal<string | null> = computed(() => {
    const state = this.reference().state;
    return Object.isNull(state) ? null : Resources.formatLightDark(state.light.color, state.dark.color);
  });
  protected readonly text: Signal<string> = computed(() => {
    const { reference, title } = this.reference();
    return Object.isNull(title) ? reference : `${reference}${Resources.linkReferenceSeparator}${title}`;
  });

  public readonly reference = input.required<LinkReference>();
  public readonly linkActivate = output<LinkOpenEvent>();
  public readonly linkMenu = output<LinkMenuEvent>();

  public constructor() {
    const focus = this.focus;
    const dismissOnEscape = (event: KeyboardEvent): void => {
      if (event.key !== Resources.escapeKey || !this.isShown)
        return;
      event.preventDefault();
      this.hide();
    };
    this.document.addEventListener(Resources.keydownEvent, dismissOnEscape, { capture: true });
    const subscription = focus.monitor(this.host).subscribe(origin => {
      if (origin === Resources.keyboardFocusOrigin)
        this.show();
    });
    effect(() => {
      const reference = this.reference();
      if (Object.isNull(reference.state))
        this.hide();
      else
        this.setCard(reference, reference.state);
    });
    inject(DestroyRef).onDestroy(() => {
      this.document.removeEventListener(Resources.keydownEvent, dismissOnEscape, { capture: true });
      subscription.unsubscribe();
      focus.stopMonitoring(this.host);
      this.cancelPending();
      this.overlay?.dispose();
    });
  }

  public get isShown(): boolean {
    return this.overlay?.isOpen ?? false;
  }

  public show(): void {
    this.cancelPending();
    const reference = this.reference();
    if (this.isShown || Object.isNull(reference.state) || !reference.hasCard)
      return;
    const overlay = this.overlay ?? this.createOverlay();
    this.card = overlay.openComponent(new ComponentPortal(LinkReferenceCardComponent), this.host, new OverlayAnchoring(OverlaySide.below, OverlayAlignment.Start, this.bounds.gap));
    this.card.instance.linkActivate.subscribe(open => {
      this.hide();
      this.linkActivate.emit(open);
    });
    this.card.instance.linkMenu.subscribe(menu => this.linkMenu.emit(menu));
    this.setCard(reference, reference.state);
    this.card.changeDetectorRef.detectChanges();
    overlay.reposition();
  }

  public hide(): void {
    this.cancelPending();
    const hadFocus = this.hasFocusInCard();
    this.overlay?.close();
    if (hadFocus)
      this.focus.focusVia(this.host, Resources.programFocusOrigin, { preventScroll: true });
  }

  protected scheduleShow(): void {
    this.cancelPending();
    this.cancelShow = this.timeSource.after(() => this.show(), this.restDelay);
  }

  protected enterCard(event: KeyboardEvent): void {
    const first = this.linkElements().at(0);
    if (event.key !== Resources.tabKey || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || Object.isUndefined(first))
      return;
    event.preventDefault();
    this.focus.focusVia(first, Resources.keyboardFocusOrigin);
  }

  protected leaveFocus(event: FocusEvent): void {
    const target = event.relatedTarget;
    if (!(target instanceof Node) || this.overlay?.element.contains(target) !== true)
      this.hide();
  }

  protected leaveChip(event: PointerEvent): void {
    if (this.hasFocusInCard())
      return;
    if (Object.isNull(this.overlay) || !this.overlay.isOpen)
      this.hide();
    else
      this.leave(event, this.host, this.overlay.element);
  }

  private setCard(reference: LinkReference, state: LinkReferenceState): void {
    this.card?.setInput(LinkReferenceChipResources.linkReferenceInput, reference);
    this.card?.setInput(LinkReferenceChipResources.linkReferenceStateInput, state);
  }

  private linkElements(): readonly HTMLElement[] {
    const overlay = this.overlay;
    return Object.isNull(overlay) || !overlay.isOpen ? [] : [...overlay.element.querySelectorAll<HTMLElement>(LinkReferenceChipResources.linkReferenceLinkSelector)];
  }

  private hasFocusInCard(): boolean {
    const overlay = this.overlay;
    return !Object.isNull(overlay) && overlay.isOpen && overlay.element.contains(this.document.activeElement);
  }

  private keepFocusRoute(overlay: AnchoredOverlay): void {
    overlay.element.addEventListener(Resources.keydownEvent, event => {
      if (event.key !== Resources.tabKey || event.altKey || event.ctrlKey || event.metaKey)
        return;
      const links = this.linkElements();
      const index = links.findIndex(t => t === this.document.activeElement);
      if (event.shiftKey ? index > 0 : index < links.length - 1)
        return;
      if (event.shiftKey) {
        event.preventDefault();
        this.focus.focusVia(this.host, Resources.keyboardFocusOrigin);
      }
      else
        this.focus.focusVia(this.host, Resources.programFocusOrigin);
    });
    overlay.element.addEventListener(LinkReferenceChipResources.focusoutEvent, event => {
      const target = event.relatedTarget;
      if (!this.document.hasFocus())
        return;
      if (!(target instanceof Node) || (!overlay.element.contains(target) && !this.host.contains(target)))
        this.hide();
    });
  }

  private createOverlay(): AnchoredOverlay {
    const overlay = new AnchoredOverlay(this.injector, LinkReferenceChipResources.linkReferenceCardPaneClass);
    overlay.element.addEventListener(Resources.pointerLeaveEvent, event => {
      if (!this.hasFocusInCard())
        this.leave(event, overlay.element, this.host);
    });
    this.keepFocusRoute(overlay);
    overlay.detachments.subscribe(() => this.card = null);
    overlay.originLost.subscribe(() => this.hide());
    this.overlay = overlay;
    return overlay;
  }

  private leave(event: PointerEvent, from: HTMLElement, toward: HTMLElement): void {
    const target = event.relatedTarget;
    if (target instanceof Node && toward.contains(target))
      return;
    const area = new PointerGraceArea(LinkReferenceChipComponent.pointOf(event), from.getBoundingClientRect(), toward.getBoundingClientRect());
    if (!(target instanceof Node) || !area.contains(LinkReferenceChipComponent.pointOf(event))) {
      this.hide();
      return;
    }
    this.cancelPending();
    const move = (moved: PointerEvent): void => {
      if (moved.target instanceof Node && toward.contains(moved.target))
        this.cancelPending();
      else if (!area.contains(LinkReferenceChipComponent.pointOf(moved)))
        this.hide();
    };
    this.document.addEventListener(Resources.pointermoveEvent, move, { capture: true, passive: true });
    this.stopGrace = () => this.document.removeEventListener(Resources.pointermoveEvent, move, { capture: true });
  }

  private cancelPending(): void {
    this.cancelShow?.();
    this.stopGrace?.();
    this.cancelShow = null;
    this.stopGrace = null;
  }

  private static pointOf(event: PointerEvent): DOMPoint {
    return new DOMPoint(event.clientX, event.clientY);
  }
}
