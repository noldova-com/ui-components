/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, type Signal, computed, inject, input, output } from "@angular/core";

import "@noldova/context.core";

import { CanvasBox } from "../../models/canvas-box.js";
import { CanvasPoint } from "../../models/canvas-point.js";
import { PointerDrag } from "../../services/pointer-drag.js";
import { Resources } from "../../../resources.js";
import { CanvasMapResources } from "./canvas-map.resources.js";

@Component({
  selector: "nol-canvas-map",
  templateUrl: "./canvas-map.component.html",
  styleUrl: "./canvas-map.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "role": "img",
    "[attr.aria-label]": "partResources.canvasMapLabel",
    "[style.--nol-canvas-map-ratio]": "ratio()",
    "(pointerdown)": "onPointerDown($event)"
  }
})
export class CanvasMapComponent {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private drag: PointerDrag | null = null;
  private lastPoint: CanvasPoint = new CanvasPoint(0, 0);
  private dragFrame: CanvasBox = new CanvasBox(0, 0, 0, 0);

  protected readonly partResources: typeof CanvasMapResources = CanvasMapResources;
  protected readonly frame: Signal<CanvasBox> = computed(() => {
    const content = this.content();
    const visible = this.visible();
    const left = Math.min(content.left, visible.left);
    const top = Math.min(content.top, visible.top);
    return new CanvasBox(left, top, Math.max(content.right, visible.right) - left, Math.max(content.bottom, visible.bottom) - top);
  });
  protected readonly viewBox: Signal<string> = computed(() => {
    const frame = this.frame();
    return `${frame.left} ${frame.top} ${Math.max(frame.width, 1)} ${Math.max(frame.height, 1)}`;
  });
  protected readonly ratio: Signal<number> = computed(() => {
    const frame = this.frame();
    return Math.max(frame.width, 1) / Math.max(frame.height, 1);
  });

  public readonly content = input.required<CanvasBox>();
  public readonly boxes = input.required<readonly CanvasBox[]>();
  public readonly visible = input.required<CanvasBox>();
  public readonly centre = output<CanvasPoint>();
  public readonly move = output<CanvasPoint>();

  public constructor() {
    inject(DestroyRef).onDestroy(() => this.endDrag());
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== Resources.primaryButton)
      return;
    event.preventDefault();
    this.endDrag();
    this.dragFrame = this.frame();
    const point = this.toContent(event);
    const visible = this.visible();
    if (point.x < visible.left || point.x > visible.right || point.y < visible.top || point.y > visible.bottom)
      this.centre.emit(point);
    this.lastPoint = point;
    this.drag = new PointerDrag(this.host, event, t => this.follow(t), () => this.endDrag(), () => this.endDrag());
    this.drag.start();
  }

  private follow(event: PointerEvent): void {
    const point = this.toContent(event);
    const last = this.lastPoint;
    this.lastPoint = point;
    if (point.x !== last.x || point.y !== last.y)
      this.move.emit(new CanvasPoint(point.x - last.x, point.y - last.y));
  }

  private endDrag(): void {
    this.drag?.stop();
    this.drag = null;
  }

  private toContent(event: PointerEvent): CanvasPoint {
    const rect = this.host.getBoundingClientRect();
    const frame = this.dragFrame;
    return new CanvasPoint(frame.left + (event.clientX - rect.left) / Math.max(rect.width, 1) * frame.width, frame.top + (event.clientY - rect.top) / Math.max(rect.height, 1) * frame.height);
  }
}
