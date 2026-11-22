/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {} from "@vitest/browser-playwright";
import { cdp, server } from "vitest/browser";

import { DomFixture } from "./dom.fixture";

class ScreenshotClip {
  public readonly x: number;
  public readonly y: number;
  public readonly width: number;
  public readonly height: number;

  public constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}

class ScreenshotCapture {
  public readonly data: string;
  public readonly whole: ScreenshotClip;
  public readonly clips: readonly ScreenshotClip[];

  public constructor(data: string, whole: ScreenshotClip, clips: readonly ScreenshotClip[]) {
    this.data = data;
    this.whole = whole;
    this.clips = clips;
  }
}

export class ScreenshotFixture {
  private static readonly BROWSER: string = "chromium";
  private static readonly ROUNDING: number = 1e-3;
  private static readonly SCALE_TOLERANCE: number = 0.01;

  public static async pixelsAsync(element: Element): Promise<ImageData> {
    return DomFixture.at(await ScreenshotFixture.piecesAsync([element]), 0);
  }

  public static async piecesAsync(elements: readonly Element[]): Promise<readonly ImageData[]> {
    const capture = await ScreenshotFixture.captureAsync(elements);
    const shot = new Image();
    shot.src = `data:image/png;base64,${capture.data}`;
    await shot.decode();
    const canvas = document.createElement("canvas");
    canvas.width = shot.width;
    canvas.height = shot.height;
    const context = canvas.getContext("2d");
    if (Object.isNull(context))
      throw new Error("The canvas has no 2D context.");
    context.drawImage(shot, 0, 0);
    const scale = shot.width / capture.whole.width;
    return capture.clips.map(t => context.getImageData(Math.round((t.x - capture.whole.x) * scale), Math.round((t.y - capture.whole.y) * scale),
      Math.round(t.width * scale), Math.round(t.height * scale)));
  }

  public static largestDifference(first: ImageData, second: ImageData, isCounted: (x: number, y: number) => boolean = () => true): number {
    if (first.width !== second.width || first.height !== second.height)
      return Number.POSITIVE_INFINITY;
    let largest = 0;
    for (let index = 0; index < first.data.length; index++) {
      const pixel = Math.floor(index / 4);
      if (isCounted(pixel % first.width, Math.floor(pixel / first.width)))
        largest = Math.max(largest, Math.abs((first.data[index] ?? 0) - (second.data[index] ?? 0)));
    }
    return largest;
  }

  public static isInsideBox(element: Element): (x: number, y: number) => boolean {
    const box = element.getBoundingClientRect();
    const ratio = devicePixelRatio;
    const left = box.left * ratio;
    const top = box.top * ratio;
    const right = box.right * ratio;
    const bottom = box.bottom * ratio;
    const x0 = Math.floor(left);
    const y0 = Math.floor(top);
    return (x, y) => x0 + x >= left && x0 + x + 1 <= right && y0 + y >= top && y0 + y + 1 <= bottom;
  }

  public static async inkStartAsync(element: Element, later: Element, isBackwards: boolean): Promise<number> {
    const shot = await ScreenshotFixture.pixelsAsync(element);
    const box = element.getBoundingClientRect();
    const part = later.getBoundingClientRect();
    const ratio = devicePixelRatio;
    const originX = Math.floor(box.left * ratio);
    const originY = Math.floor(box.top * ratio);
    const first = isBackwards ? Math.floor(box.right * ratio) - originX - 1 : Math.ceil(box.left * ratio) - originX;
    const stop = isBackwards ? Math.ceil(part.right * ratio) - originX - 1 : Math.floor(part.left * ratio) - originX;
    const step = isBackwards ? -1 : 1;
    const columns = Array.from({ length: Math.max(0, (stop - first) * step) }, (_, i) => first + i * step);
    const rows = Array.from({ length: Math.floor(part.bottom * ratio) - Math.ceil(part.top * ratio) }, (_, i) => Math.ceil(part.top * ratio) - originY + i);
    const difference = (x: number, y: number): number => {
      const at = (y * shot.width + x) * 4;
      const edge = (y * shot.width + first) * 4;
      return Math.max(...[0, 1, 2].map(t => Math.abs((shot.data[at + t] ?? 0) - (shot.data[edge + t] ?? 0))));
    };
    const strongest = Math.max(0, ...columns.flatMap(x => rows.map(y => difference(x, y))));
    const found = columns.find(x => rows.some(y => difference(x, y) > strongest / 2));
    if (Object.isUndefined(found))
      throw new Error("The element holds no ink before its later part.");
    return isBackwards ? box.right - (originX + found + 1) / ratio : (originX + found) / ratio - box.left;
  }

  public static isInsideCircle(shot: ImageData): (x: number, y: number) => boolean {
    const radius = Math.min(shot.width, shot.height) / 2 - 1;
    return (x, y) => Math.hypot(x + 0.5 - shot.width / 2, y + 0.5 - shot.height / 2) <= radius;
  }

  private static async captureAsync(elements: readonly Element[]): Promise<ScreenshotCapture> {
    if (server.browser !== ScreenshotFixture.BROWSER)
      throw new Error(`A screenshot is taken through Chromium's DevTools protocol, and this run's browser is ${server.browser}.`);
    const first = elements.at(0);
    if (Object.isUndefined(first))
      throw new Error("A capture reads at least one element, and none was given.");
    const view = first.ownerDocument.defaultView;
    if (Object.isNull(view))
      throw new Error("The element to screenshot is in no window's document, so where it lies on the page isn't known.");
    const selection = view.getSelection();
    if (!Object.isNull(selection) && !selection.isCollapsed)
      throw new Error(`The element's document holds a selection, "${selection.toString().slice(0, 40)}", whose colors would paint over what the capture reads.`);
    const isAllInView = (): boolean => elements.every(t => ScreenshotFixture.isInView(t.getBoundingClientRect(), view));
    if (!isAllInView())
      first.scrollIntoView({ block: "center", inline: "center" });
    if (elements.length > 1 && !isAllInView())
      throw new Error("Elements read in one capture must all lie in the frame's viewport, since a capture beyond it draws them otherwise.");
    const origin = ScreenshotFixture.frameOrigin(view);
    const clips = elements.map(element => {
      const box = element.getBoundingClientRect();
      const x = Math.floor(origin.x + box.left + ScreenshotFixture.ROUNDING);
      const y = Math.floor(origin.y + box.top + ScreenshotFixture.ROUNDING);
      const right = Math.ceil(origin.x + box.right - ScreenshotFixture.ROUNDING);
      const bottom = Math.ceil(origin.y + box.bottom - ScreenshotFixture.ROUNDING);
      return new ScreenshotClip(x, y, right - x, bottom - y);
    });
    const x = Math.min(...clips.map(t => t.x));
    const y = Math.min(...clips.map(t => t.y));
    const whole = new ScreenshotClip(x, y, Math.max(...clips.map(t => t.x + t.width)) - x, Math.max(...clips.map(t => t.y + t.height)) - y);
    const clip = { x: whole.x, y: whole.y, width: whole.width, height: whole.height, scale: 1 };
    const captureBeyondViewport = whole.width > view.innerWidth || whole.height > view.innerHeight;
    const shot: unknown = await cdp().send("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport });
    const data = Object.isObject(shot) && "data" in shot ? shot.data : undefined;
    if (!Object.isString(data))
      throw new Error("Chromium returned no screenshot.");
    return new ScreenshotCapture(data, whole, clips);
  }

  private static isInView(box: DOMRect, view: Window): boolean {
    return box.left >= 0 && box.top >= 0 && box.right <= view.innerWidth && box.bottom <= view.innerHeight;
  }

  private static frameOrigin(start: Window): DOMPoint {
    let left = 0;
    let top = 0;
    for (let view: Window = start; view !== view.parent; view = view.parent) {
      const frame = view.frameElement;
      if (Object.isNull(frame))
        throw new Error("A frame around the element can't be read, so where its frame lies on the page isn't known.");
      const box = frame.getBoundingClientRect();
      const style = view.parent.getComputedStyle(frame);
      const startEdge = frame.clientLeft + parseFloat(style.paddingLeft);
      const topEdge = frame.clientTop + parseFloat(style.paddingTop);
      const width = box.width - startEdge - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth);
      if (Math.abs(width - view.innerWidth) > ScreenshotFixture.SCALE_TOLERANCE)
        throw new Error(`A frame around the element is scaled, ${width} px wide on the page for ${view.innerWidth} px inside it, so its pixels aren't the page's.`);
      left += box.left + startEdge;
      top += box.top + topEdge;
    }
    return new DOMPoint(left + (start.top?.scrollX ?? 0), top + (start.top?.scrollY ?? 0));
  }
}
