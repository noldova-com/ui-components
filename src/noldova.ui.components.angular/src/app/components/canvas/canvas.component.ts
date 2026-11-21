/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DestroyRef, ElementRef, type Signal, type WritableSignal, afterRenderEffect, computed, inject, input, model, signal, untracked, viewChild } from "@angular/core";

import "@noldova/context.core";

import { ButtonVariant } from "../../enums/button-variant.js";
import { CanvasFitAlignment } from "../../enums/canvas-fit-alignment.js";
import { CanvasBox } from "../../models/canvas-box.js";
import { CanvasItems } from "../../models/canvas-items.js";
import { CanvasPoint } from "../../models/canvas-point.js";
import { CanvasView } from "../../models/canvas-view.js";
import { ContentMovedEvent } from "../../models/content-moved-event.js";
import { DragGesture } from "../../models/drag-gesture.js";
import { Resources } from "../../../resources.js";
import { ButtonComponent } from "../button/button.component.js";
import { CanvasMapComponent } from "../canvas-map/canvas-map.component.js";
import { CanvasMapResources } from "../canvas-map/canvas-map.resources.js";
import { IconButtonComponent } from "../icon-button/icon-button.component.js";
import { ToolbarItemDirective } from "../toolbar/toolbar-item.directive.js";
import { ToolbarDirective } from "../toolbar/toolbar.directive.js";
import { CanvasResources } from "./canvas.resources.js";

@Component({
  selector: "nol-canvas",
  imports: [ButtonComponent, CanvasMapComponent, IconButtonComponent, ToolbarDirective, ToolbarItemDirective],
  templateUrl: "./canvas.component.html",
  styleUrl: "./canvas.component.css",
  providers: [CanvasItems],
  host: {
    "role": "region",
    "tabindex": "0",
    "[attr.aria-label]": "label()",
    "[attr.aria-roledescription]": "partResources.canvasRoleDescription",
    "[attr.aria-keyshortcuts]": "partResources.canvasKeyShortcuts",
    "[class.nol-canvas-dragging]": "isDragging()",
    "[style.background-position]": "gridPosition()",
    "(pointerdown)": "onPointerDown($event)",
    "(pointermove)": "onPointerMove($event)",
    "(pointerup)": "onPointerEnd($event)",
    "(pointercancel)": "onPointerEnd($event)",
    "(lostpointercapture)": "onPointerEnd($event)",
    "(focusin)": "onFocusIn($event)",
    "(keydown)": "onKeyDown($event)"
  }
})
export class CanvasComponent {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly items: Signal<readonly HTMLElement[]> = inject(CanvasItems, { self: true }).elements;
  private readonly plane: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("plane");
  private readonly tools: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>("tools");
  private readonly map: Signal<ElementRef<HTMLElement> | undefined> = viewChild(CanvasMapComponent, { read: ElementRef });
  private readonly shown: WritableSignal<CanvasView> = signal(CanvasView.initial);
  private readonly size: WritableSignal<CanvasBox> = signal(new CanvasBox(0, 0, 0, 0), { equal: (a, b) => a.equals(b) });
  private readonly pointers: Map<number, CanvasPoint> = new Map<number, CanvasPoint>();
  private pressStart: CanvasPoint = new CanvasPoint(0, 0);
  private hasFitted: boolean = false;

  protected readonly partResources: typeof CanvasResources = CanvasResources;
  protected readonly textVariant: ButtonVariant = ButtonVariant.Text;
  protected readonly isDragging: WritableSignal<boolean> = signal(false);
  protected readonly contentBox: WritableSignal<CanvasBox> = signal(new CanvasBox(0, 0, 0, 0), { equal: (a, b) => a.equals(b) });
  protected readonly itemBoxes: WritableSignal<readonly CanvasBox[]> = signal([], { equal: (a, b) => CanvasComponent.sameBoxes(a, b) });
  protected readonly transform: Signal<string> = computed(() => {
    const view = this.shown();
    return `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
  });
  protected readonly gridPosition: Signal<string> = computed(() => `${this.shown().x}px ${this.shown().y}px`);
  protected readonly zoomText: Signal<string> = computed(() => `${Math.round(this.shown().zoom * CanvasResources.canvasPercent)}%`);
  protected readonly visibleBox: Signal<CanvasBox> = computed(() => this.shown().visible(this.size().width, this.size().height));
  protected readonly mapLabel: Signal<string> = computed(() => this.mapShown() ? CanvasResources.canvasHideMapLabel : CanvasResources.canvasShowMapLabel);

  public readonly label = input.required<string>();
  public readonly mapShown = model<boolean>(true);
  public readonly fitAlignment = input<CanvasFitAlignment>(CanvasFitAlignment.Centre);
  public readonly view: Signal<CanvasView> = this.shown.asReadonly();

  public constructor() {
    const onWheel = (event: WheelEvent): void => this.onWheel(event);
    const onBlur = (): void => this.endPointers();
    this.host.addEventListener(CanvasResources.canvasWheelEvent, onWheel, { passive: false });
    window.addEventListener(Resources.blurEvent, onBlur);
    let frame: number | null = null;
    const measureOnce = (): void => {
      frame ??= requestAnimationFrame(() => {
        frame = null;
        this.measure();
      });
    };
    const observer = new ResizeObserver(measureOnce);
    const moves = new MutationObserver(measureOnce);
    inject(DestroyRef).onDestroy(() => {
      if (!Object.isNull(frame))
        cancelAnimationFrame(frame);
      observer.disconnect();
      moves.disconnect();
      this.host.removeEventListener(CanvasResources.canvasWheelEvent, onWheel);
      window.removeEventListener(Resources.blurEvent, onBlur);
    });
    afterRenderEffect(() => {
      const items = this.items();
      observer.disconnect();
      for (const element of [this.host, this.plane().nativeElement, ...items])
        observer.observe(element);
      moves.observe(this.plane().nativeElement, CanvasResources.canvasContentMoves);
    });
    afterRenderEffect({
      read: () => {
        this.shown();
        this.size();
        const area = this.freeAreaOnScreen();
        untracked(() => this.host.dispatchEvent(new ContentMovedEvent(area, this.host)));
      }
    });
  }

  public fit(): void {
    this.shown.set(CanvasView.fit(this.contentBox(), this.freeArea(), this.fitAlignment()));
  }

  public actualSize(): void {
    this.zoomAround(1);
  }

  public zoomIn(): void {
    this.zoomAround(this.shown().zoom * CanvasResources.canvasZoomStep);
  }

  public zoomOut(): void {
    this.zoomAround(this.shown().zoom / CanvasResources.canvasZoomStep);
  }

  public centreOn(point: CanvasPoint): void {
    const size = this.size();
    this.shown.update(t => t.centreOn(point.x, point.y, size.width, size.height));
  }

  protected toggleMap(): void {
    this.mapShown.update(t => !t);
  }

  protected moveBy(distance: CanvasPoint): void {
    this.shown.update(t => t.panBy(-distance.x * t.zoom, -distance.y * t.zoom));
  }

  protected onPointerDown(event: PointerEvent): void {
    const path = event.composedPath();
    const inside = path.slice(0, path.indexOf(this.host)).filter((t): t is Element => t instanceof Element);
    if (event.button !== Resources.primaryButton || inside.some(t => t.matches(CanvasResources.canvasNoPanSelector)))
      return;
    this.pointers.set(event.pointerId, new CanvasPoint(event.clientX, event.clientY));
    this.host.setPointerCapture(event.pointerId);
    this.pressStart = new CanvasPoint(event.clientX, event.clientY);
    this.isDragging.set(this.pointers.size > 1);
  }

  protected onPointerMove(event: PointerEvent): void {
    const last = this.pointers.get(event.pointerId);
    if (Object.isUndefined(last))
      return;
    if ((event.buttons & CanvasResources.canvasPrimaryButtons) === 0) {
      this.onPointerEnd(event);
      return;
    }
    const next = new CanvasPoint(event.clientX, event.clientY);
    if (this.pointers.size > 1) {
      this.pinch(event.pointerId, last, next);
      return;
    }
    if (!this.isDragging() && !DragGesture.hasStarted(this.pressStart.x, this.pressStart.y, next.x, next.y))
      return;
    this.isDragging.set(true);
    this.pointers.set(event.pointerId, next);
    this.shown.update(t => t.panBy(next.x - last.x, next.y - last.y));
  }

  protected onPointerEnd(event: PointerEvent): void {
    this.pointers.delete(event.pointerId);
    if (this.pointers.size === 0)
      this.isDragging.set(false);
  }

  protected onFocusIn(event: FocusEvent): void {
    const target = event.target;
    if (!(target instanceof Element) || !this.plane().nativeElement.contains(target))
      return;
    const plane = this.plane().nativeElement;
    const drawn = plane.getBoundingClientRect();
    const drawnZoom = drawn.width / plane.offsetWidth;
    const view = this.shown();
    const area = this.freeArea();
    const box = target.getBoundingClientRect();
    const scale = view.zoom / drawnZoom;
    const left = view.x + (box.left - drawn.left) * scale;
    const top = view.y + (box.top - drawn.top) * scale;
    const shift = (start: number, length: number, areaStart: number, areaLength: number): number =>
      start < areaStart || length > areaLength ? areaStart - start : Math.min(0, areaStart + areaLength - start - length);
    const dx = shift(left, box.width * scale, area.left, area.width);
    const dy = shift(top, box.height * scale, area.top, area.height);
    if (Math.abs(dx) >= CanvasResources.canvasFocusSlackPixels || Math.abs(dy) >= CanvasResources.canvasFocusSlackPixels)
      this.shown.set(view.panBy(dx, dy));
    plane.style.transform = this.transform();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.target !== this.host || event.ctrlKey || event.altKey || event.metaKey)
      return;
    const step = CanvasResources.canvasKeyStepRem * this.rootSize();
    const pans: Readonly<Record<string, CanvasPoint>> = {
      [CanvasResources.canvasLeftKey]: new CanvasPoint(step, 0),
      [CanvasResources.canvasRightKey]: new CanvasPoint(-step, 0),
      [Resources.arrowUpKey]: new CanvasPoint(0, step),
      [Resources.arrowDownKey]: new CanvasPoint(0, -step)
    };
    const pan = pans[event.key];
    if (!Object.isUndefined(pan))
      this.shown.update(t => t.panBy(pan.x, pan.y));
    else if (CanvasResources.canvasZoomInKeys.includes(event.key))
      this.zoomIn();
    else if (CanvasResources.canvasZoomOutKeys.includes(event.key))
      this.zoomOut();
    else if (event.key === CanvasResources.canvasFitKey)
      this.fit();
    else
      return;
    event.preventDefault();
  }

  private onWheel(event: WheelEvent): void {
    event.preventDefault();
    const rect = this.host.getBoundingClientRect();
    const dy = CanvasView.wheelPixels(event.deltaY, event.deltaMode, rect.height);
    if (event.ctrlKey || event.metaKey) {
      this.shown.update(t => t.zoomAt(t.zoom * CanvasView.wheelZoomFactor(dy), event.clientX - rect.left, event.clientY - rect.top));
      return;
    }
    const dx = CanvasView.wheelPixels(event.deltaX, event.deltaMode, rect.width);
    const isSideways = event.shiftKey && dx === 0;
    this.shown.update(t => isSideways ? t.panBy(-dy, 0) : t.panBy(-dx, -dy));
  }

  private pinch(pointerId: number, last: CanvasPoint, next: CanvasPoint): void {
    const others = [...this.pointers].filter(t => t[0] !== pointerId).map(t => t[1]);
    this.pointers.set(pointerId, next);
    const rect = this.host.getBoundingClientRect();
    for (const other of others.slice(0, 1)) {
      const before = Math.hypot(last.x - other.x, last.y - other.y);
      const after = Math.hypot(next.x - other.x, next.y - other.y);
      this.shown.update(t => t.zoomAt(t.zoom * after / Math.max(before, 1), (next.x + other.x) / 2 - rect.left, (next.y + other.y) / 2 - rect.top));
    }
  }

  private endPointers(): void {
    this.pointers.clear();
    this.isDragging.set(false);
  }

  private freeArea(): CanvasBox {
    const size = this.size();
    const tools = this.tools().nativeElement;
    const inset = tools.offsetTop;
    const top = inset + tools.offsetHeight + inset;
    const map = this.map()?.nativeElement;
    const bottom = Object.isUndefined(map) ? size.height - inset : map.offsetTop + map.clientHeight - CanvasMapResources.canvasMapHeightRem * this.rootSize() - inset;
    return new CanvasBox(inset, top, size.width - inset * 2, bottom - top);
  }

  private freeAreaOnScreen(): DOMRectReadOnly {
    const area = this.freeArea();
    const at = this.host.getBoundingClientRect();
    return new DOMRectReadOnly(at.left + this.host.clientLeft + area.left, at.top + this.host.clientTop + area.top, area.width, area.height);
  }

  private zoomAround(zoom: number): void {
    const size = this.size();
    this.shown.update(t => t.zoomAt(zoom, size.width / 2, size.height / 2));
  }

  private rootSize(): number {
    return Number.parseFloat(getComputedStyle(this.host.ownerDocument.documentElement).fontSize);
  }

  private static sameBoxes(a: readonly CanvasBox[], b: readonly CanvasBox[]): boolean {
    return a.length === b.length && a.every((t, i) => b.slice(i, i + 1).every(u => u.equals(t)));
  }

  private measure(): void {
    const plane = this.plane().nativeElement;
    const base = plane.getBoundingClientRect();
    const zoom = new DOMMatrixReadOnly(getComputedStyle(plane).transform).a;
    this.size.set(new CanvasBox(0, 0, this.host.clientWidth, this.host.clientHeight));
    this.contentBox.set(new CanvasBox(0, 0, plane.offsetWidth, plane.offsetHeight));
    this.itemBoxes.set(this.items().filter(t => plane.contains(t)).map(t => {
      const box = t.getBoundingClientRect();
      return new CanvasBox((box.left - base.left) / zoom, (box.top - base.top) / zoom, box.width / zoom, box.height / zoom);
    }));
    if (this.hasFitted || plane.offsetWidth === 0)
      return;
    this.hasFitted = true;
    this.fit();
  }
}
