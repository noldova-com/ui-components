/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CanvasBox } from "../../../src/app/models/canvas-box";
import { CanvasView } from "../../../src/app/models/canvas-view";

describe("CanvasView", () => {
  const view = (t: CanvasView): number[] => [t.x, t.y, t.zoom];

  it("keeps its zoom from 25% to 200%", () => {
    expect([0.1, 0.25, 1, 2, 5].map(t => new CanvasView(0, 0, t).zoom)).toEqual([0.25, 0.25, 1, 2, 2]);
  });

  it("zooms around a point, which stays where it was on the screen", () => {
    const start = new CanvasView(40, 30, 1);
    const zoomed = start.zoomAt(1.5, 200, 100);
    const under = (t: CanvasView): number[] => [(200 - t.x) / t.zoom, (100 - t.y) / t.zoom];

    expect([view(zoomed), under(zoomed)]).toEqual([[-40, -5, 1.5], under(start)]);
  });

  it("zooms around a point only as far as its limits", () => {
    expect([new CanvasView(0, 0, 1).zoomAt(9, 100, 100).zoom, new CanvasView(0, 0, 1).zoomAt(0.01, 100, 100).zoom]).toEqual([2, 0.25]);
  });

  it("pans by a distance on the screen", () => {
    expect(view(new CanvasView(10, 20, 0.5).panBy(-30, 5))).toEqual([-20, 25, 0.5]);
  });

  it("fits content into an area, centred, never above 100%", () => {
    const small = CanvasView.fit(new CanvasBox(0, 0, 200, 100), new CanvasBox(0, 40, 1000, 400));
    const large = CanvasView.fit(new CanvasBox(0, 0, 2000, 400), new CanvasBox(16, 40, 1000, 400));

    expect([view(small), view(large)]).toEqual([[400, 190, 1], [16, 140, 0.5]]);
  });

  it("fits content that starts away from the origin by its own box", () => {
    expect(view(CanvasView.fit(new CanvasBox(100, 50, 400, 200), new CanvasBox(0, 0, 400, 200)))).toEqual([-100, -50, 1]);
  });

  it("puts content too large even at 25% at the area's start rather than centring it off the area", () => {
    expect(view(CanvasView.fit(new CanvasBox(0, 0, 8000, 6000), new CanvasBox(16, 40, 1000, 400)))).toEqual([16, 40, 0.25]);
  });

  it("fits empty content, or into an empty area, at 100% at the area's start", () => {
    expect([CanvasView.fit(new CanvasBox(10, 10, 0, 50), new CanvasBox(16, 40, 100, 100)), CanvasView.fit(new CanvasBox(0, 0, 50, 50), new CanvasBox(16, 40, 100, 0))].map(view))
      .toEqual([[6, 30, 1], [16, 40, 1]]);
  });

  it("centres a point of the content in an area of the screen", () => {
    expect(view(new CanvasView(0, 0, 2).centreOn(100, 50, 800, 600))).toEqual([200, 200, 2]);
  });

  it("names the content it shows in an area of the screen, and where content shows on the screen", () => {
    const shown = new CanvasView(-100, 50, 0.5);
    const visible = shown.visible(400, 300);
    const screen = shown.toScreen(new CanvasBox(200, 0, 100, 40));

    expect([[visible.left, visible.top, visible.width, visible.height], [screen.left, screen.top, screen.width, screen.height]]).toEqual([[200, -100, 800, 600], [0, 50, 50, 20]]);
  });

  it("reads a wheel's distance in pixels from pixels, lines and pages", () => {
    expect([CanvasView.wheelPixels(3, WheelEvent.DOM_DELTA_PIXEL, 500), CanvasView.wheelPixels(3, WheelEvent.DOM_DELTA_LINE, 500), CanvasView.wheelPixels(1, WheelEvent.DOM_DELTA_PAGE, 500)])
      .toEqual([3, 48, 500]);
  });

  it("zooms by a wheel's distance, in, out, and at most twice or half per event", () => {
    expect([0, -500, 250, -5000, 5000].map(t => Math.round(CanvasView.wheelZoomFactor(t) * 1000) / 1000))
      .toEqual([1, 2, 0.707, 2, 0.5]);
  });
});

describe("CanvasBox", () => {
  it("names its right and bottom edges", () => {
    const box = new CanvasBox(10, 20, 30, 40);

    expect([box.right, box.bottom]).toEqual([40, 60]);
  });

  it("contains a box inside it, edges included, and no box that crosses an edge", () => {
    const box = new CanvasBox(0, 0, 100, 100);

    expect([new CanvasBox(0, 0, 100, 100), new CanvasBox(-1, 0, 10, 10), new CanvasBox(0, -1, 10, 10), new CanvasBox(95, 0, 10, 10), new CanvasBox(0, 95, 10, 10)].map(t => box.contains(t)))
      .toEqual([true, false, false, false, false]);
  });

  it("overlaps a box that shares area with it, and no box that only touches an edge", () => {
    const box = new CanvasBox(0, 0, 100, 100);

    expect([new CanvasBox(90, 90, 20, 20), new CanvasBox(100, 0, 10, 10), new CanvasBox(-10, 0, 10, 10), new CanvasBox(0, 100, 10, 10), new CanvasBox(0, -10, 10, 10)].map(t => box.overlaps(t)))
      .toEqual([true, false, false, false, false]);
  });
});
