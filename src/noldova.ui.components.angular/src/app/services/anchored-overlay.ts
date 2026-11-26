/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type GlobalPositionStrategy, type OverlayRef, createGlobalPositionStrategy, createOverlayRef } from "@angular/cdk/overlay";
import type { ComponentPortal, TemplatePortal } from "@angular/cdk/portal";
import { type ComponentRef, type EmbeddedViewRef, type Injector, afterEveryRender, untracked } from "@angular/core";
import { type Observable, Subject } from "rxjs";

import "@noldova/context.core";

import type { IResizeObservers } from "../interfaces/i-resize-observers.js";
import type { ITimeSource } from "../interfaces/i-time-source.js";
import { ClockTokens } from "../models/clock-tokens.js";
import { ContentMovedEvent } from "../models/content-moved-event.js";
import type { OverlayAnchoring } from "../models/overlay-anchoring.js";
import type { OverlayPlacement } from "../models/overlay-placement.js";
import { PlacedBoxes } from "../models/placed-boxes.js";
import { ResizeTokens } from "../models/resize-tokens.js";
import { DomResources } from "../../dom-resources.js";
import { AnchoredOverlayResources } from "./anchored-overlay.resources.js";
import { OverlayBoundsService } from "./overlay-bounds.service.js";
import { OverlayOriginsService } from "./overlay-origins.service.js";

export class AnchoredOverlay {
  private readonly injector: Injector;
  private readonly overlay: OverlayRef;
  private readonly strategy: GlobalPositionStrategy;
  private readonly bounds: OverlayBoundsService;
  private readonly origins: OverlayOriginsService;
  private readonly timeSource: ITimeSource;
  private readonly observers: IResizeObservers;
  private readonly cleanups: (() => void)[] = [];
  private readonly originLostValue: Subject<void> = new Subject<void>();
  private origin: Element | null = null;
  private originAt: DOMRect | null = null;
  private area: (() => DOMRect) | null = null;
  private anchoring: OverlayAnchoring | null = null;
  private placementValue: OverlayPlacement | null = null;
  private placedWidth: number | null = null;
  private placedHeight: number = 0;
  private placedBoxesValue: PlacedBoxes | null = null;
  private readonly changes: MutationObserver = new MutationObserver(() => {
    this.isChanged = true;
  });
  private isChanged: boolean = false;
  private direction: string | null = null;
  private isReset: boolean = false;

  public constructor(injector: Injector, panelClass: string) {
    this.injector = injector;
    this.bounds = injector.get(OverlayBoundsService);
    this.origins = injector.get(OverlayOriginsService);
    this.timeSource = injector.get(ClockTokens.timeSource);
    this.observers = injector.get(ResizeTokens.observers);
    this.strategy = createGlobalPositionStrategy(injector);
    this.overlay = createOverlayRef(injector, { positionStrategy: this.strategy, panelClass });
    this.overlay.detachments().subscribe(() => this.release());
    this.reset();
    this.isReset = true;
  }

  public get overlayRef(): OverlayRef {
    return this.overlay;
  }

  public get element(): HTMLElement {
    return this.overlay.overlayElement;
  }

  public get isOpen(): boolean {
    return this.overlay.hasAttached();
  }

  public get placement(): OverlayPlacement | null {
    return this.placementValue;
  }

  public get placedBoxes(): PlacedBoxes | null {
    return this.placedBoxesValue;
  }

  public get detachments(): Observable<void> {
    return this.overlay.detachments();
  }

  public get outsidePointerEvents(): Observable<MouseEvent> {
    return this.overlay.outsidePointerEvents();
  }

  public get keydownEvents(): Observable<KeyboardEvent> {
    return this.overlay.keydownEvents();
  }

  public get originLost(): Observable<void> {
    return this.originLostValue;
  }

  public openComponent<T>(portal: ComponentPortal<T>, origin: Element, anchoring: OverlayAnchoring, area: (() => DOMRect) | null = null): ComponentRef<T> {
    const attached = this.overlay.attach(portal);
    this.follow(origin, anchoring, area);
    return attached;
  }

  public openTemplate<T>(portal: TemplatePortal<T>, origin: Element, anchoring: OverlayAnchoring): EmbeddedViewRef<T> {
    const attached = this.overlay.attach(portal);
    this.follow(origin, anchoring);
    return attached;
  }

  public follow(origin: Element, anchoring: OverlayAnchoring, area: (() => DOMRect) | null = null): void {
    this.release();
    this.origin = origin;
    this.origins.remember(this.overlay.overlayElement, origin);
    this.anchoring = anchoring;
    this.area = area;
    const reposition = (): void => this.reposition();
    const scrolled = (event: Event): void => {
      if (event.target instanceof Node && !this.element.contains(event.target) && event.target.contains(origin) && this.hasOriginMoved(origin))
        this.originLostValue.next();
    };
    const moved = (event: Event): void => {
      if (!(event instanceof ContentMovedEvent) || !event.isAround(origin))
        return;
      if (event.shows(origin.getBoundingClientRect())) {
        this.reposition();
        return;
      }
      if (this.element.contains(document.activeElement))
        event.holder.focus({ preventScroll: true });
      this.originLostValue.next();
    };
    let cancelFrame: (() => void) | null = null;
    const resize = this.observers.create(entries => {
      if (entries.some(t => this.hasResizedTo(t.borderBoxSize[0])))
        cancelFrame ??= this.timeSource.frame(() => {
          cancelFrame = null;
          this.reposition();
        });
    });
    resize.observe(this.element);
    const hidden = this.observers.create(() => {
      if (!origin.checkVisibility())
        this.originLostValue.next();
    });
    hidden.observe(origin);
    this.changes.observe(this.element, AnchoredOverlayResources.overlayContentChanges);
    const rendered = untracked(() => afterEveryRender({
      read: () => {
        const isChanged = this.changes.takeRecords().length > 0 || this.isChanged;
        this.isChanged = false;
        if (!isChanged || !this.hasResized())
          return;
        const originAt = this.originAt;
        this.reposition();
        this.originAt = originAt;
      }
    }, { injector: this.injector }));
    window.addEventListener(DomResources.resizeEvent, reposition);
    document.addEventListener(DomResources.scrollEvent, scrolled, { capture: true, passive: true });
    document.addEventListener(DomResources.contentMovedEvent, moved, { capture: true });
    this.cleanups.push(
      () => resize.disconnect(),
      () => this.changes.disconnect(),
      () => rendered.destroy(),
      () => hidden.disconnect(),
      () => cancelFrame?.(),
      () => window.removeEventListener(DomResources.resizeEvent, reposition),
      () => document.removeEventListener(DomResources.scrollEvent, scrolled, { capture: true }),
      () => document.removeEventListener(DomResources.contentMovedEvent, moved, { capture: true }));
    this.reposition();
  }

  public reposition(): void {
    if (Object.isNull(this.origin) || Object.isNull(this.anchoring))
      return;
    const element = this.element;
    const direction = this.origin.matches(DomResources.rightToLeftSelector) ? DomResources.rightToLeftDirection : DomResources.leftToRightDirection;
    if (direction !== this.direction) {
      this.overlay.setDirection(direction);
      this.direction = direction;
    }
    if (!this.isReset)
      this.reset();
    const bounds = this.bounds.boundsFor(this.origin);
    const size = element.getBoundingClientRect();
    const originAt = this.origin.getBoundingClientRect();
    this.originAt = originAt;
    const anchor = Object.isNull(this.area) ? originAt : this.area();
    const placement = bounds.place(anchor, size.width, size.height, this.anchoring);
    element.style.maxHeight = Object.isNull(placement.maxHeight) ? String.empty : `${placement.maxHeight}px`;
    this.strategy.left(`${placement.left}px`).top(`${placement.top}px`);
    this.overlay.updatePosition();
    this.placementValue = placement;
    const height = Object.isNull(placement.maxHeight) ? size.height : Math.min(size.height, placement.maxHeight);
    this.placedWidth = size.width;
    this.placedHeight = height;
    this.placedBoxesValue = new PlacedBoxes(DOMRectReadOnly.fromRect(originAt), new DOMRectReadOnly(size.left + placement.left, size.top + placement.top, size.width, height));
    this.isReset = false;
    this.changes.takeRecords();
    this.isChanged = false;
  }

  public close(): void {
    this.overlay.detach();
  }

  public dispose(): void {
    this.overlay.dispose();
  }

  private reset(): void {
    const element: HTMLElement | null = this.overlay.overlayElement;
    if (Object.isNull(element))
      return;
    element.style.maxHeight = String.empty;
    this.strategy.left(AnchoredOverlayResources.zeroPixels).top(AnchoredOverlayResources.zeroPixels);
    this.overlay.updatePosition();
  }

  private release(): void {
    this.cleanups.splice(0).forEach(t => t());
    if (!this.isReset)
      this.reset();
    this.isReset = true;
    this.origin = null;
    this.originAt = null;
    this.area = null;
    this.anchoring = null;
    this.placementValue = null;
    this.placedWidth = null;
    this.placedHeight = 0;
    this.placedBoxesValue = null;
  }

  private hasResizedTo(box: ResizeObserverSize | undefined): boolean {
    return Object.isUndefined(box) || this.differsFrom(box.inlineSize, box.blockSize);
  }

  private hasResized(): boolean {
    const box = this.element.getBoundingClientRect();
    return this.differsFrom(box.width, box.height);
  }

  private differsFrom(width: number, height: number): boolean {
    return Object.isNull(this.placedWidth) || Math.abs(width - this.placedWidth) >= 1 || Math.abs(height - this.placedHeight) >= 1;
  }

  private hasOriginMoved(origin: Element): boolean {
    const now = origin.getBoundingClientRect();
    return now.left !== this.originAt?.left || now.top !== this.originAt.top;
  }
}
