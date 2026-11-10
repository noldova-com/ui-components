/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EnvironmentInjector, PLATFORM_ID, createEnvironmentInjector } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { OverlayBoundsService } from "../../../src/app/services/overlay-bounds.service";
import { AppearanceFixture } from "../../../src/testing/services/appearance-fixture";

describe("OverlayBoundsService", () => {
  const anchors: HTMLElement[] = [];

  beforeEach(() => {
    AppearanceFixture.apply();
  });

  afterEach(() => {
    anchors.splice(0).forEach(t => t.remove());
    document.documentElement.style.fontSize = "";
    AppearanceFixture.reset();
  });

  function anchorIn(edge: string | null): HTMLElement {
    const band = document.createElement("div");
    if (edge !== null)
      band.setAttribute("data-nol-chrome", edge);
    const anchor = document.createElement("button");
    band.append(anchor);
    document.body.append(band);
    anchors.push(band);
    return anchor;
  }

  it("keeps overlays a gap inside the viewport, below the window row and above the status bar", () => {
    const service = TestBed.inject(OverlayBoundsService);
    const view = document.documentElement;
    const bounds = service.boundsFor(anchorIn(null));

    expect(service.gap).toBe(AppearanceFixture.measureLook("space-2"));
    expect([bounds.top, bounds.right, bounds.bottom, bounds.left])
      .toEqual([AppearanceFixture.measureLook("window-row-height") + service.gap, view.clientWidth - service.gap, view.clientHeight - AppearanceFixture.measureLook("status-bar-height") - service.gap, service.gap]);
  });

  it("lets an overlay anchored in a chrome band come within a gap of that band's edge, and reach the panels' edges at the sides", () => {
    const service = TestBed.inject(OverlayBoundsService);
    const view = document.documentElement;
    const margin = AppearanceFixture.measureLook("panel-card-margin");
    const fromRow = service.boundsFor(anchorIn("top"));
    const fromStatus = service.boundsFor(anchorIn("bottom"));

    expect([fromRow.top, fromRow.right, fromRow.bottom, fromRow.left]).toEqual([service.gap, view.clientWidth - margin, view.clientHeight - AppearanceFixture.measureLook("status-bar-height") - service.gap, margin]);
    expect([fromStatus.top, fromStatus.right, fromStatus.bottom, fromStatus.left]).toEqual([AppearanceFixture.measureLook("window-row-height") + service.gap, view.clientWidth - margin, view.clientHeight - service.gap, margin]);
    expect(margin).toBeLessThan(service.gap);
  });

  it("takes the writing direction of the element an overlay is anchored to", () => {
    const service = TestBed.inject(OverlayBoundsService);
    const mirrored = anchorIn(null);
    mirrored.parentElement?.setAttribute("dir", "rtl");

    expect([service.boundsFor(anchorIn(null)).isRightToLeft, service.boundsFor(mirrored).isRightToLeft]).toEqual([false, true]);
  });

  it("reads its rem-based bounds again after the text size changes", () => {
    const service = TestBed.inject(OverlayBoundsService);
    const before = service.boundsFor(anchorIn(null));

    document.documentElement.style.fontSize = "20px";
    const after = service.boundsFor(anchorIn(null));

    expect(after.top).toBeGreaterThan(before.top);
    expect(after.top).toBeCloseTo(AppearanceFixture.measureLook("window-row-height") + AppearanceFixture.measureLook("space-2"), 3);
    expect(service.gap).toBe(10);
  });

  it("measures each look once however many overlays it bounds", () => {
    const service = TestBed.inject(OverlayBoundsService);
    const measure = vi.spyOn(service as unknown as { measure: (probe: HTMLElement) => number }, "measure");

    for (let index = 0; index < 20; index++) {
      service.boundsFor(anchorIn(null));
      service.boundsFor(anchorIn("top"));
    }

    expect(measure.mock.calls.map(([probe]) => probe.style.height).sort()).toEqual(["panel-card-margin", "space-2", "status-bar-height", "window-row-height"].map(t => `var(--nol-${t})`));
  });

  it("keeps its looks' probes in the page, hidden from sight and from assistive technology, from its start until it is destroyed, and adds none to measure", () => {
    const scoped = createEnvironmentInjector([OverlayBoundsService], TestBed.inject(EnvironmentInjector));
    const before = document.body.childElementCount;
    const service = scoped.get(OverlayBoundsService);
    const holder = document.body.lastElementChild;
    const placed = document.body.childElementCount;
    service.boundsFor(anchorIn("bottom"));
    const measured = document.body.childElementCount;
    const visibility = holder === null ? null : getComputedStyle(holder).visibility;
    scoped.destroy();

    expect([placed - before, measured - placed - 1, holder?.childElementCount, holder?.getAttribute("aria-hidden"), visibility]).toEqual([1, 0, 4, "true", "hidden"]);
    expect(holder?.isConnected).toBe(false);
  });

  it("places nothing in the page and watches nothing when it starts outside a browser, as when a page is prerendered", () => {
    const listen = vi.spyOn(window, "addEventListener");
    const scoped = createEnvironmentInjector([{ provide: PLATFORM_ID, useValue: "server" }, OverlayBoundsService], TestBed.inject(EnvironmentInjector));
    const before = document.body.innerHTML;
    const service = scoped.get(OverlayBoundsService);
    const after = document.body.innerHTML;
    const listened = listen.mock.calls.map(t => t[0]);
    listen.mockRestore();
    scoped.destroy();

    expect(service).toBeInstanceOf(OverlayBoundsService);
    expect(after).toBe(before);
    expect(listened).toEqual([]);
  });

  it("measures its looks again once the root's or the body's attributes or the window's size change, and not for a style sheet added to the head", async () => {
    const service = TestBed.inject(OverlayBoundsService);
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const gap = AppearanceFixture.measureLook("space-2");
    const gaps = [service.gap];

    document.body.style.setProperty("--nol-space-2", "1rem");
    await Promise.resolve();
    gaps.push(service.gap);
    document.body.style.removeProperty("--nol-space-2");
    gaps.push(service.gap);
    const style = document.head.appendChild(document.createElement("style"));
    anchors.push(style);
    style.textContent = "body { --nol-space-2: 0.75rem; }";
    gaps.push(service.gap);
    window.dispatchEvent(new Event("resize"));
    gaps.push(service.gap);

    expect(gaps).toEqual([gap, rem, gap, gap, 0.75 * rem]);
  });
});
