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
    element.style.cssText = `position: ${position}; ${style}; width: 37.5px; height: 21.25px; background: linear-gradient(90deg, #d33 0 30%, #3a5 30% 70%, #36c 70%)`;
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

  it("reads the same pixels, byte for byte, as Playwright's screenshot of the element, at a whole or a fractional place in the test's frame", async () => {
    const results: string[] = [];
    for (const style of ["left: 0; top: 0", "left: 13.5px; top: 41.25px", "left: 200.75px; top: 7.5px"]) {
      const element = placed(style);
      const [ours, theirs] = [await ScreenshotFixture.pixelsAsync(element), await playwrightPixelsAsync(element)];
      results.push(`${ours.width}x${ours.height} ${String(ours.data.every((value, index) => value === theirs.data[index]))} ${theirs.width}x${theirs.height}`);
    }

    expect(results).toEqual(["38x22 true 38x22", "38x22 true 38x22", "39x22 true 39x22"]);
  });

  it("scrolls an element below the frame's viewport into it, and reads the same pixels as Playwright's screenshot of it", async () => {
    const element = placed(`left: 20.5px; top: ${innerHeight + 300}px`, "absolute");
    placed(`left: 0; top: ${innerHeight * 3}px`, "absolute");

    const ours = await ScreenshotFixture.pixelsAsync(element);
    const box = element.getBoundingClientRect();
    const theirs = await playwrightPixelsAsync(element);

    expect([box.top >= 0 && box.bottom <= innerHeight, `${ours.width}x${ours.height}`, ours.data.every((value, index) => value === theirs.data[index])]).toEqual([true, `${theirs.width}x${theirs.height}`, true]);
  });

  it("reads the same pixels as Playwright's screenshot of an element just past the frame's top edge, which no scroll can bring in, and of one wider than the frame", async () => {
    const results: string[] = [];
    for (const element of [placed("left: 55.25px; top: -1px"), placed(`left: 0; top: 30px; width: ${innerWidth + 120}px`, "absolute")]) {
      const [ours, theirs] = [await ScreenshotFixture.pixelsAsync(element), await playwrightPixelsAsync(element)];
      results.push(`${String(ours.width === theirs.width && ours.height === theirs.height)} ${String(ours.data.every((value, index) => value === theirs.data[index]))}`);
    }

    expect(results).toEqual(["true true", "true true"]);
  });
});
