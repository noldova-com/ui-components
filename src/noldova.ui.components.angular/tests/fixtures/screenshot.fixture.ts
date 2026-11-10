/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { page } from "vitest/browser";

export class ScreenshotFixture {
  public static async pixelsAsync(element: Element): Promise<ImageData> {
    const shot = new Image();
    shot.src = `data:image/png;base64,${await page.screenshot({ element, save: false })}`;
    await shot.decode();
    const canvas = document.createElement("canvas");
    canvas.width = shot.width;
    canvas.height = shot.height;
    const context = canvas.getContext("2d");
    if (Object.isNull(context))
      throw new Error("The canvas has no 2D context.");
    context.drawImage(shot, 0, 0);
    return context.getImageData(0, 0, shot.width, shot.height);
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
    const [left, top, right, bottom] = [box.left * ratio, box.top * ratio, box.right * ratio, box.bottom * ratio];
    const [x0, y0] = [Math.floor(left), Math.floor(top)];
    return (x, y) => x0 + x >= left && x0 + x + 1 <= right && y0 + y >= top && y0 + y + 1 <= bottom;
  }

  public static async inkStartAsync(element: Element, later: Element, isBackwards: boolean): Promise<number> {
    const shot = await ScreenshotFixture.pixelsAsync(element);
    const [box, part, ratio] = [element.getBoundingClientRect(), later.getBoundingClientRect(), devicePixelRatio];
    const [originX, originY] = [Math.floor(box.left * ratio), Math.floor(box.top * ratio)];
    const first = isBackwards ? Math.floor(box.right * ratio) - originX - 1 : Math.ceil(box.left * ratio) - originX;
    const stop = isBackwards ? Math.ceil(part.right * ratio) - originX - 1 : Math.floor(part.left * ratio) - originX;
    const step = isBackwards ? -1 : 1;
    const columns = Array.from({ length: Math.max(0, (stop - first) * step) }, (_, i) => first + i * step);
    const rows = Array.from({ length: Math.floor(part.bottom * ratio) - Math.ceil(part.top * ratio) }, (_, i) => Math.ceil(part.top * ratio) - originY + i);
    const difference = (x: number, y: number): number => {
      const [at, edge] = [(y * shot.width + x) * 4, (y * shot.width + first) * 4];
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
}
