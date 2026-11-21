/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, DestroyRef, ElementRef, type Signal, computed, inject, input, output } from "@angular/core";

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
  host: {
    "role": "button",
    "tabindex": "0",
    "[attr.aria-label]": "partResources.canvasMapLabel",
    "[style.width.rem]": "widthRem()",
    "[style.height.rem]": "heightRem()",
    "(pointerdown)": "onPointerDown($event)",
    "(keydown)": "onKeyDown($event)"
  }
})
export class CanvasMapComponent {
  private readonly host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private drag: PointerDrag | null = null;
  private lastPoint: CanvasPoint = new CanvasPoint(0, 0);
  private dragFrame: CanvasBox = new CanvasBox(0, 0, 0, 0);
  private readonly ratio: Signal<number> = computed(() => Math.max(this.content().width, 1) / Math.max(this.content().height, 1));
  private readonly unitsPerRem: Signal<number> = computed(() => Math.max(this.content().width, 1) / this.widthRem());

  protected readonly partResources: typeof CanvasMapResources = CanvasMapResources;
  protected readonly viewBox: Signal<string> = computed(() => {
    const content = this.content();
    return `${content.left} ${content.top} ${Math.max(content.width, 1)} ${Math.max(content.height, 1)}`;
  });
  protected readonly widthRem: Signal<number> = computed(() => Math.min(CanvasMapResources.canvasMapWidestRem, CanvasMapResources.canvasMapHeightRem * this.ratio()));
  protected readonly heightRem: Signal<number> = computed(() => this.widthRem() / this.ratio());
  protected readonly boxRadius: Signal<number> = computed(() => this.unitsPerRem() * CanvasMapResources.canvasMapBoxRadiusRem);
  protected readonly viewRadius: Signal<number> = computed(() => this.unitsPerRem() * CanvasMapResources.canvasMapViewRadiusRem);

  public readonly content = input.required<CanvasBox>();
  public readonly boxes = input.required<readonly CanvasBox[]>();
  public readonly visible = input.required<CanvasBox>();
  public readonly centre = output<CanvasPoint>();
  public readonly move = output<CanvasPoint>();
  public readonly fit = output();

  public constructor() {
    inject(DestroyRef).onDestroy(() => this.endDrag());
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== Resources.primaryButton)
      return;
    event.preventDefault();
    this.endDrag();
    this.dragFrame = this.content();
    const point = this.toContent(event);
    const visible = this.visible();
    if (point.x < visible.left || point.x > visible.right || point.y < visible.top || point.y > visible.bottom)
      this.centre.emit(point);
    this.lastPoint = point;
    this.drag = new PointerDrag(this.host, event, t => this.follow(t), () => this.endDrag(), () => this.endDrag());
    this.drag.start();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (!CanvasMapResources.canvasMapFitKeys.includes(event.key))
      return;
    event.preventDefault();
    this.fit.emit();
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
