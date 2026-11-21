/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CanvasFitAlignment } from "../enums/canvas-fit-alignment.js";
import { CanvasBox } from "./canvas-box.js";

export class CanvasView {
  public static readonly minimumZoom: number = 0.25;
  public static readonly maximumZoom: number = 2;
  public static readonly fitZoom: number = 1;
  public static readonly lineHeight: number = 16;
  public static readonly wheelZoomRate: number = 0.01;
  public static readonly wheelZoomStep: number = 2;
  public static readonly initial: CanvasView = new CanvasView(0, 0, 1);

  public readonly x: number;
  public readonly y: number;
  public readonly zoom: number;

  public constructor(x: number, y: number, zoom: number) {
    this.x = x;
    this.y = y;
    this.zoom = CanvasView.clampZoom(zoom);
  }

  public static clampZoom(zoom: number): number {
    return Math.min(CanvasView.maximumZoom, Math.max(CanvasView.minimumZoom, zoom));
  }

  public static fit(content: CanvasBox, area: CanvasBox, alignment: CanvasFitAlignment = CanvasFitAlignment.Centre): CanvasView {
    if (content.width <= 0 || content.height <= 0 || area.width <= 0 || area.height <= 0)
      return new CanvasView(area.left - content.left, area.top - content.top, CanvasView.fitZoom);
    const zoom = CanvasView.clampZoom(Math.min(CanvasView.fitZoom, area.width / content.width, area.height / content.height));
    const x = area.left + Math.max(0, (area.width - content.width * zoom) / 2) - content.left * zoom;
    const y = area.top + (alignment === CanvasFitAlignment.Top ? 0 : Math.max(0, (area.height - content.height * zoom) / 2)) - content.top * zoom;
    return new CanvasView(x, y, zoom);
  }

  public static wheelPixels(delta: number, deltaMode: number, pageSize: number): number {
    if (deltaMode === WheelEvent.DOM_DELTA_LINE)
      return delta * CanvasView.lineHeight;
    if (deltaMode === WheelEvent.DOM_DELTA_PAGE)
      return delta * pageSize;
    return delta;
  }

  public static wheelZoomFactor(deltaPixels: number): number {
    const factor = Math.exp(-deltaPixels * CanvasView.wheelZoomRate);
    return Math.min(CanvasView.wheelZoomStep, Math.max(1 / CanvasView.wheelZoomStep, factor));
  }

  public panBy(dx: number, dy: number): CanvasView {
    return new CanvasView(this.x + dx, this.y + dy, this.zoom);
  }

  public zoomAt(zoom: number, pointX: number, pointY: number): CanvasView {
    const next = CanvasView.clampZoom(zoom);
    const ratio = next / this.zoom;
    return new CanvasView(pointX - (pointX - this.x) * ratio, pointY - (pointY - this.y) * ratio, next);
  }

  public centreOn(contentX: number, contentY: number, width: number, height: number): CanvasView {
    return new CanvasView(width / 2 - contentX * this.zoom, height / 2 - contentY * this.zoom, this.zoom);
  }

  public visible(width: number, height: number): CanvasBox {
    return new CanvasBox(-this.x / this.zoom, -this.y / this.zoom, width / this.zoom, height / this.zoom);
  }

  public toScreen(box: CanvasBox): CanvasBox {
    return new CanvasBox(this.x + box.left * this.zoom, this.y + box.top * this.zoom, box.width * this.zoom, box.height * this.zoom);
  }
}
