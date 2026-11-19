/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { page } from "vitest/browser";

import { ScreenshotFixture } from "./screenshot.fixture";

describe("ScreenshotFixture", () => {
  const elements: HTMLElement[] = [];

  const placed = (style: string, position: string = "fixed"): HTMLElement => {
    const element = document.body.appendChild(document.createElement("div"));
    element.style.cssText = `position: ${position}; width: 37.5px; height: 21.25px; background: linear-gradient(90deg, #d33 0 30%, #3a5 30% 70%, #36c 70%); ${style}`;
    element.textContent = "Ag";
    elements.push(element);
    return element;
  };

  const playwrightPixelsAsync = async (element: Element): Promise<ImageData> => {
    const shot = new Image();
    shot.src = `data:image/png;base64,${await page.screenshot({ element, save: false })}`;
    await shot.decode();
    const canvas = document.createElement("canvas");
    [canvas.width, canvas.height] = [shot.width, shot.height];
    const context = canvas.getContext("2d");
    if (Object.isNull(context))
      throw new Error("The canvas has no 2D context.");
    context.drawImage(shot, 0, 0);
    return context.getImageData(0, 0, shot.width, shot.height);
  };

  afterEach(() => {
    elements.splice(0).forEach(element => element.remove());
    scrollTo(0, 0);
  });

  const isAll = (image: ImageData, color: readonly number[]): boolean => image.data.every((value, index) => value === color[index % 4]);

  const sameAs = (ours: ImageData, theirs: ImageData): string =>
    `${ours.width}x${ours.height} ${String(ours.width === theirs.width && ours.height === theirs.height && ours.data.every((value, index) => value === theirs.data[index]))}`;

  for (const [where, style] of [["near the frame's start", "left: 3px; top: 4px"], ["far into the frame", "left: 900px; top: 600px"]] as const)
    it(`reads an element at a whole place ${where} as its own color, edge to edge, at its size`, async () => {
      const element = placed(`${style}; width: 30px; height: 20px; background: rgb(204, 51, 51); color: transparent`);

      const image = await ScreenshotFixture.pixelsAsync(element);

      expect([image.width, image.height, isAll(image, [204, 51, 51, 255])]).toEqual([30, 20, true]);
    });

  it("scrolls an element below the frame's viewport into it, and reads it as its own color, edge to edge", async () => {
    const element = placed(`left: 20px; top: ${innerHeight + 300}px; width: 30px; height: 20px; background: rgb(51, 102, 204); color: transparent`, "absolute");
    placed(`left: 0; top: ${innerHeight * 3}px`, "absolute");

    const image = await ScreenshotFixture.pixelsAsync(element);
    const box = element.getBoundingClientRect();

    expect([box.top >= 0 && box.bottom <= innerHeight, image.width, image.height, isAll(image, [51, 102, 204, 255])]).toEqual([true, 30, 20, true]);
  });

  it("reads the same pixels, byte for byte, as Playwright's screenshot of an element at a fractional place in the test's frame", async () => {
    const results: string[] = [];
    for (const style of ["left: 13.5px; top: 41.25px", "left: 200.75px; top: 7.5px"]) {
      const element = placed(style);
      results.push(sameAs(await ScreenshotFixture.pixelsAsync(element), await playwrightPixelsAsync(element)));
    }

    expect(results).toEqual(["38x22 true", "39x22 true"]);
  });

  it("reads the same pixels as Playwright's screenshot of an element just past the frame's top edge, which no scroll can bring in, and of one wider than the frame", async () => {
    const results: string[] = [];
    for (const element of [placed("left: 55.25px; top: -1px"), placed(`left: 0; top: 30px; width: ${innerWidth + 120}px`, "absolute")])
      results.push(sameAs(await ScreenshotFixture.pixelsAsync(element), await playwrightPixelsAsync(element)).replace(/^\S+ /u, ""));

    expect(results).toEqual(["true", "true"]);
  });
});
