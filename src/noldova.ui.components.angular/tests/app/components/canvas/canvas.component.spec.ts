/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ComponentPortal } from "@angular/cdk/portal";
import { Component, Injector, computed, input, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { cdp, userEvent } from "vitest/browser";

import { CanvasMapComponent } from "../../../../src/app/components/canvas-map/canvas-map.component";
import { CanvasItemDirective } from "../../../../src/app/components/canvas/canvas-item.directive";
import { CanvasComponent } from "../../../../src/app/components/canvas/canvas.component";
import { CanvasControlsPlacement } from "../../../../src/app/enums/canvas-controls-placement";
import { CanvasFitAlignment } from "../../../../src/app/enums/canvas-fit-alignment";
import { OverlayAlignment } from "../../../../src/app/enums/overlay-alignment";
import { CanvasPoint } from "../../../../src/app/models/canvas-point";
import { DragGesture } from "../../../../src/app/models/drag-gesture";
import { OverlayAnchoring } from "../../../../src/app/models/overlay-anchoring";
import { OverlaySide } from "../../../../src/app/models/overlay-side";
import { AnchoredOverlay } from "../../../../src/app/services/anchored-overlay";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { HangLimitFixture } from "../../../fixtures/hang-limit.fixture";
import { RenderedFrameFixture } from "../../../fixtures/rendered-frame.fixture";

@Component({
  template: `<div style="width: 80px; height: 30px;"></div>`
})
class OverlayContentComponent {
}

@Component({
  imports: [CanvasComponent, CanvasItemDirective],
  template: `
    <div [hidden]="hidden()">
      <nol-canvas label="Organization" [style.width.px]="800" [style.height.px]="500" [(mapShown)]="mapShown" [fitAlignment]="alignment()" [controlsPlacement]="placement()" [isFlush]="flush()">
        @if (cards().length > 0) {
          <div [style.display]="'grid'" [style.grid-template-columns]="'repeat(' + columns() + ', 12rem)'" [style.gap.rem]="1" [style.padding.rem]="1">
            @for (card of cards(); track card) {
              <div nolCanvasItem class="card" [style.height.rem]="5">{{ card }} <button type="button" class="open" (click)="opened.update(t => [...t, card])">Open</button></div>
            }
          </div>
        }
      </nol-canvas>
    </div>
  `
})
class CanvasHostComponent {
  public readonly cards = signal(Array.from({ length: 24 }, (_, t) => t + 1));
  public readonly columns = computed(() => Math.min(this.cards().length, 6));
  public readonly mapShown = signal(true);
  public readonly hidden = signal(false);
  public readonly alignment = signal(CanvasFitAlignment.Centre);
  public readonly placement = signal(CanvasControlsPlacement.Edges);
  public readonly flush = signal(false);
  public readonly opened = signal<readonly number[]>([]);
}

describe("CanvasComponent", () => {
  let fixture: ComponentFixture<CanvasHostComponent>;
  let host: CanvasHostComponent;

  const canvas = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-canvas");
  const instance = (): CanvasComponent => fixture.debugElement.query(By.directive(CanvasComponent)).componentInstance as CanvasComponent;
  const plane = (): HTMLElement => DomFixture.one(canvas(), ".nol-canvas-plane");
  const tools = (): HTMLElement => DomFixture.one(canvas(), ".nol-canvas-bar");
  const band = (): HTMLElement => DomFixture.one(canvas(), ".nol-canvas-tools");
  const hint = (): HTMLElement => DomFixture.one(canvas(), ".nol-canvas-hint");
  const map = (): HTMLElement => DomFixture.one(canvas(), "nol-canvas-map");
  const mapView = (): SVGRectElement => DomFixture.oneOf(canvas(), ".nol-canvas-map-view", SVGRectElement);
  const cards = (): HTMLElement[] => DomFixture.all(canvas(), ".card");
  const zoomText = (): string => DomFixture.one(canvas(), ".nol-canvas-zoom").textContent.trim();
  const button = (name: string): HTMLButtonElement => DomFixture.oneOf(canvas(), `.nol-canvas-${name}`, HTMLButtonElement);
  const at = (index: number): DOMRect => DomFixture.at(cards(), index).getBoundingClientRect();
  const view = (): { readonly x: number; readonly y: number; readonly zoom: number } => ({ x: instance().view().x, y: instance().view().y, zoom: instance().view().zoom });
  const overlaps = (a: DOMRect, b: DOMRect): boolean => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  const measuredAsync = async (count: number = cards().length): Promise<void> => {
    await DomChangeFixture.untilAsync(() => expect(DomFixture.allOf(map(), ".nol-canvas-map-box", SVGRectElement)).toHaveLength(count));
  };

  const changedAsync = async (before: string): Promise<void> => {
    await DomChangeFixture.untilAsync(() => expect(plane().style.transform).not.toBe(before));
  };

  const wheelAsync = async (init: WheelEventInit, at: DOMRect = canvas().getBoundingClientRect()): Promise<WheelEvent> => {
    const before = plane().style.transform;
    const event = new WheelEvent("wheel", { clientX: at.left + at.width / 2, clientY: at.top + at.height / 2, bubbles: true, cancelable: true, ...init });
    canvas().dispatchEvent(event);
    await changedAsync(before);
    return event;
  };

  const pointer = (target: Element, type: string, pointerId: number, clientX: number, clientY: number, button: number = 0): void => {
    target.dispatchEvent(new PointerEvent(type, { pointerId, button, buttons: 1, clientX, clientY, bubbles: true, cancelable: true, composed: true }));
  };

  const holdCapture = (element: HTMLElement): void => {
    const held = new Set<number>();
    vi.spyOn(element, "setPointerCapture").mockImplementation(t => void held.add(t));
    vi.spyOn(element, "releasePointerCapture").mockImplementation(t => void held.delete(t));
    vi.spyOn(element, "hasPointerCapture").mockImplementation(t => held.has(t));
  };

  const key = (target: HTMLElement, name: string): KeyboardEvent => {
    const event = new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };

  const rootSize = (): number => Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  // The canvas's free area: inside its edges, below the tool band and above the map, each by the band's inset.
  const free = (): DOMRect => {
    const inset = band().offsetTop;
    const top = band().getBoundingClientRect().bottom + inset;
    const bottom = map().getBoundingClientRect().bottom - 7 * rootSize() - inset;
    return new DOMRect(canvas().getBoundingClientRect().left + canvas().clientLeft + inset, top, canvas().clientWidth - inset * 2, bottom - top);
  };
  const inside = (box: DOMRect, area: DOMRect): boolean =>
    box.left >= area.left - 2 && box.top >= area.top - 2 && box.right <= area.right + 2 && box.bottom <= area.bottom + 2;
  // A point of this frame in the top page's coordinates, where the browser's own input lands.
  const onPage = (x: number, y: number): CanvasPoint => {
    let point = new CanvasPoint(x, y);
    for (let shown: Window = window, frame = shown.frameElement; !Object.isNull(frame); shown = shown.parent, frame = shown.frameElement) {
      const box = frame.getBoundingClientRect();
      const scale = box.width / shown.innerWidth;
      point = new CanvasPoint(box.left + frame.clientLeft + point.x * scale, box.top + frame.clientTop + point.y * scale);
    }
    return point;
  };
  // A tap of a finger at the point, as a touch screen sends it: its pointerup comes before the mousedown that focuses. No touch emulation, which
  // leaves the page saying it has no hover and a coarse pointer after it ends, for every spec file after this one on the page.
  const tapAsync = async (x: number, y: number, moved: number = 0): Promise<void> => {
    const point = onPage(x, y);
    await cdp().send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: point.x, y: point.y }] });
    if (moved !== 0) {
      const to = onPage(x + moved, y);
      await cdp().send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: to.x, y: to.y }] });
    }
    await cdp().send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  };
  // Moves the browser's mouse and pen to the top page's corner, off this frame, so the point a tap or press left them at hovers nothing in
  // the specs after.
  const awayAsync = async (): Promise<void> => {
    const pointerTypes: readonly ("mouse" | "pen")[] = ["mouse", "pen"];
    for (const pointerType of pointerTypes)
      await cdp().send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 0, y: 0, pointerType });
  };
  // A press of a pen's tip at the point.
  const penAsync = async (x: number, y: number): Promise<void> => {
    const point = onPage(x, y);
    await cdp().send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", buttons: 1, clickCount: 1, pointerType: "pen" });
    await cdp().send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", buttons: 0, clickCount: 1, pointerType: "pen" });
  };

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(CanvasHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(async () => {
    fixture.destroy();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  it("is a region named by its label, described as a canvas with its keys, and reachable by Tab", () => {
    expect([canvas().getAttribute("role"), canvas().getAttribute("aria-label"), canvas().getAttribute("aria-roledescription"), canvas().getAttribute("aria-keyshortcuts"), canvas().tabIndex])
      .toEqual(["region", "Organization", "canvas", "ArrowLeft ArrowRight ArrowUp ArrowDown + - 0", 0]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`fits every item inside it once laid out, clear of its toolbar and its map, below 100%, from the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        await measuredAsync(24);
        instance().fit();
        await fixture.whenStable();
        const frame = canvas().getBoundingClientRect();
        const toolbar = tools().getBoundingClientRect();
        const tip = hint().getBoundingClientRect();
        const icon = DomFixture.one(button("fit"), "[nolButtonIcon]").getBoundingClientRect();
        const overview = map().getBoundingClientRect();
        const placed = cards().map(t => t.getBoundingClientRect());

        expect(placed.filter(t => t.left < frame.left || t.top < frame.top || t.right > frame.right || t.bottom > frame.bottom || overlaps(t, toolbar) || overlaps(t, tip) || overlaps(t, overview)))
          .toEqual([]);
        expect([`${Math.round(instance().view().zoom * 100)}%`, instance().view().zoom < 1]).toEqual([zoomText(), true]);
        expect([getComputedStyle(canvas()).backgroundColor, getComputedStyle(tools()).backgroundColor, getComputedStyle(map()).backgroundColor,
          getComputedStyle(mapView()).stroke, getComputedStyle(DomFixture.oneOf(map(), ".nol-canvas-map-box", SVGRectElement)).fill])
          .toEqual([AppearanceFixture.readColor(theme, mode, "window"), AppearanceFixture.readColor(theme, mode, "panel"), AppearanceFixture.readColor(theme, mode, "panel"),
            AppearanceFixture.readColor(theme, mode, "accent"), AppearanceFixture.readColor(theme, mode, "badge")]);
        AppearanceFixture.expectPixels(toolbar.left - frame.left, AppearanceFixture.measureLook("space-2") + AppearanceFixture.measureLook("border-width"));
        AppearanceFixture.expectPixels(frame.right - overview.right, AppearanceFixture.measureLook("space-2") + AppearanceFixture.measureLook("border-width"));
        AppearanceFixture.expectPixels(Math.max(map().clientHeight / 7, map().clientWidth / 14), AppearanceFixture.toPixels(1));
        AppearanceFixture.expectPixels(tip.left - toolbar.right, AppearanceFixture.measureLook("space-1"));
        AppearanceFixture.expectPixels(tip.top + tip.height / 2, toolbar.top + toolbar.height / 2);
        expect([getComputedStyle(hint()).backgroundColor, getComputedStyle(hint()).color, icon.width > 0, icon.right <= button("fit").getBoundingClientRect().right])
          .toEqual([AppearanceFixture.readColor(theme, mode, "panel"), AppearanceFixture.readColor(theme, mode, "text-muted"), true, true]);
        expect([getComputedStyle(canvas()).backgroundImage, getComputedStyle(canvas()).backgroundSize])
          .toEqual([`radial-gradient(${AppearanceFixture.readColor(theme, mode, "menu-border")} 1px, rgba(0, 0, 0, 0) 1px)`, `${String(rootSize() * 1.5)}px ${String(rootSize() * 1.5)}px`]);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`fills a pane flush with no border or radius on the panel surface once it says so, and has its card border and the window surface by default, in the ${theme.id} theme in ${mode} mode`, async () => {
        AppearanceFixture.apply(theme, mode);
        const look = (): readonly (string | number)[] => {
          const style = getComputedStyle(canvas());
          return [style.borderTopStyle, Number.parseFloat(style.borderTopWidth), Number.parseFloat(style.borderTopLeftRadius), style.backgroundColor, canvas().clientLeft];
        };
        const card = look();
        host.flush.set(true);
        fixture.detectChanges();
        await fixture.whenStable();

        expect([card[0], card[3], look()]).toEqual(["solid", AppearanceFixture.readColor(theme, mode, "window"), ["none", 0, 0, AppearanceFixture.readColor(theme, mode, "panel"), 0]]);
        AppearanceFixture.expectPixels(Number(card[1]), AppearanceFixture.measureLook("border-width"));
        AppearanceFixture.expectPixels(Number(card[2]), AppearanceFixture.measureLook("radius-large"));
      });

  it("fits every item inside it, clear of its toolbar, its hint and its map under forced colors, drawing them in system colors", async () => {
    await ForcedColorsFixture.activateAsync();
    instance().fit();
    await measuredAsync(24);
    const frame = canvas().getBoundingClientRect();
    const toolbar = tools().getBoundingClientRect();
    const tip = hint().getBoundingClientRect();
    const overview = map().getBoundingClientRect();

    expect(cards().map(t => t.getBoundingClientRect())
      .filter(t => t.left < frame.left || t.top < frame.top || t.right > frame.right || t.bottom > frame.bottom || overlaps(t, toolbar) || overlaps(t, tip) || overlaps(t, overview)))
      .toEqual([]);
    expect([getComputedStyle(map()).backgroundColor, getComputedStyle(mapView()).stroke, getComputedStyle(tools()).borderTopColor, getComputedStyle(canvas()).borderTopColor,
      getComputedStyle(hint()).borderTopColor, getComputedStyle(hint()).backgroundColor])
      .toEqual([ForcedColorsFixture.resolve("Canvas"), ForcedColorsFixture.resolve("Highlight"), ForcedColorsFixture.resolve("CanvasText"),
        ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("CanvasText"), ForcedColorsFixture.resolve("Canvas")]);
    AppearanceFixture.expectPixels(tip.left - toolbar.right, AppearanceFixture.measureLook("space-1"));
  });

  it("places its toolbar and hint at its top-left and its map at its bottom-right, space-2 inside its border, by default", async () => {
    await measuredAsync(24);
    const frame = canvas().getBoundingClientRect();
    const toolbar = tools().getBoundingClientRect();
    const overview = map().getBoundingClientRect();
    const inset = AppearanceFixture.measureLook("space-2") + AppearanceFixture.measureLook("border-width");

    AppearanceFixture.expectPixels(toolbar.left - frame.left, inset);
    AppearanceFixture.expectPixels(toolbar.top - frame.top, inset);
    AppearanceFixture.expectPixels(frame.right - overview.right, inset);
    AppearanceFixture.expectPixels(frame.bottom - overview.bottom, inset);
    expect([getComputedStyle(hint()).display, hint().getBoundingClientRect().width > 0]).toEqual(["block", true]);
  });

  it("floats its toolbar space-3 inside its bottom-right corner and its map space-3 above it, with no hint, and fits its items clear of both", async () => {
    host.placement.set(CanvasControlsPlacement.Floating);
    fixture.detectChanges();
    await measuredAsync(24);
    instance().fit();
    await fixture.whenStable();
    const frame = canvas().getBoundingClientRect();
    const toolbar = tools().getBoundingClientRect();
    const overview = map().getBoundingClientRect();
    const space = AppearanceFixture.measureLook("space-3");
    const inset = space + AppearanceFixture.measureLook("border-width");
    const placed = cards().map(t => t.getBoundingClientRect());

    AppearanceFixture.expectPixels(frame.right - toolbar.right, inset);
    AppearanceFixture.expectPixels(frame.bottom - toolbar.bottom, inset);
    AppearanceFixture.expectPixels(frame.right - overview.right, inset);
    AppearanceFixture.expectPixels(toolbar.top - overview.bottom, space);
    expect([getComputedStyle(hint()).display, document.elementFromPoint(overview.left + overview.width / 2, overview.top + overview.height / 2)?.closest("nol-canvas-map") === map()])
      .toEqual(["none", true]);
    expect(placed.filter(t => t.left < frame.left + inset - 1 || t.top < frame.top + inset - 1 || t.right > frame.right || t.bottom > frame.bottom || overlaps(t, toolbar) || overlaps(t, overview)))
      .toEqual([]);
  });

  for (const placement of [CanvasControlsPlacement.Floating, CanvasControlsPlacement.Edges])
    for (const mode of AppearanceFixture.modes)
      for (const theme of AppearanceFixture.themes)
        it(`wraps its ${placement} toolbar to keep every control inside a narrow canvas and reachable, down to its widest control, from the ${theme.id} theme in ${mode} mode`, async () => {
          AppearanceFixture.apply(theme, mode);
          host.placement.set(placement);
          host.cards.set([1, 2, 3]);
          fixture.detectChanges();
          await measuredAsync(3);
          const controls = (): HTMLElement[] => DomFixture.all(tools(), "button, .nol-canvas-zoom");
          const border = AppearanceFixture.measureLook("border-width");
          const inset = AppearanceFixture.measureLook(placement === CanvasControlsPlacement.Floating ? "space-3" : "space-2") + border;
          const widest = Math.max(...controls().map(t => t.getBoundingClientRect().width));
          const narrowest = widest + 2 * (AppearanceFixture.measureLook("space-1") + border) + 2 * inset;

          for (const width of [AppearanceFixture.toPixels(13.75), narrowest]) {
            canvas().style.width = `${width}px`;
            const frame = canvas().getBoundingClientRect();
            const toolbar = tools().getBoundingClientRect();
            const outside = controls().filter(t => {
              const box = t.getBoundingClientRect();
              return box.left < frame.left + inset - 0.5 || box.right > frame.right - inset + 0.5 || box.top < frame.top + inset - 0.5 || box.bottom > frame.bottom - inset + 0.5;
            });
            const covered = controls().filter(t => {
              const box = t.getBoundingClientRect();
              return document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)?.closest(".nol-canvas-bar > *") !== t;
            });

            expect([toolbar.width < AppearanceFixture.toPixels(13.75), outside.map(t => t.className), covered.map(t => t.className)]).toEqual([true, [], []]);
            AppearanceFixture.expectPixels(placement === CanvasControlsPlacement.Floating ? frame.right - toolbar.right : toolbar.left - frame.left, inset);
          }
        });

  it("fits its items above its floating toolbar once its map is hidden, from space-3 below its top", async () => {
    host.placement.set(CanvasControlsPlacement.Floating);
    host.alignment.set(CanvasFitAlignment.Top);
    host.cards.set([1, 2]);
    fixture.detectChanges();
    await measuredAsync(2);
    button("map-toggle").click();
    await DomChangeFixture.untilAsync(() => expect(DomFixture.maybe(canvas(), "nol-canvas-map")).toBeNull());
    instance().fit();
    await fixture.whenStable();
    const frame = canvas().getBoundingClientRect();
    const toolbar = tools().getBoundingClientRect();

    AppearanceFixture.expectPixels(view().y, AppearanceFixture.measureLook("space-3"));
    AppearanceFixture.expectPixels(frame.bottom - toolbar.bottom, AppearanceFixture.measureLook("space-3") + AppearanceFixture.measureLook("border-width"));
    expect(cards().map(t => t.getBoundingClientRect()).filter(t => overlaps(t, toolbar))).toEqual([]);
  });

  it("fits a few items at 100%, never larger", async () => {
    host.cards.set([1, 2]);
    await measuredAsync(2);
    instance().fit();
    await fixture.whenStable();

    expect([zoomText(), instance().view().zoom]).toEqual(["100%", 1]);
  });

  it("fits its items at the top of the free area below its toolbar's band when its alignment says so, centred across either way", async () => {
    host.cards.set([1, 2]);
    await measuredAsync(2);
    instance().fit();
    await fixture.whenStable();
    const centred = view();
    host.alignment.set(CanvasFitAlignment.Top);
    await fixture.whenStable();
    instance().fit();
    const top = view();

    expect([top.x, top.y, centred.y > top.y]).toEqual([centred.x, band().offsetTop * 2 + band().offsetHeight, true]);
  });

  it("fits its items over the whole area once its map is hidden, and says whether the map shows", async () => {
    await measuredAsync(24);
    const shown = instance().view().zoom;
    button("map-toggle").click();
    await DomChangeFixture.untilAsync(() => expect(DomFixture.maybe(canvas(), "nol-canvas-map")).toBeNull());
    button("fit").click();
    await fixture.whenStable();
    const frame = canvas().getBoundingClientRect();

    expect([host.mapShown(), button("map-toggle").getAttribute("aria-label"), button("map-toggle").getAttribute("aria-pressed"), instance().view().zoom >= shown])
      .toEqual([false, "Show the overview map", "false", true]);
    expect(cards().map(t => t.getBoundingClientRect()).filter(t => t.bottom > frame.bottom || t.top < band().getBoundingClientRect().bottom)).toEqual([]);
  });

  it("zooms around the pointer with Ctrl and the wheel, keeping the item under it in place", async () => {
    await measuredAsync(24);
    const before = at(7);
    await wheelAsync({ deltaY: -50, ctrlKey: true }, before);
    const after = at(7);

    expect(Math.abs(after.left + after.width / 2 - (before.left + before.width / 2))).toBeLessThan(1);
    expect(Math.abs(after.top + after.height / 2 - (before.top + before.height / 2))).toBeLessThan(1);
    expect(after.width / before.width).toBeCloseTo(Math.exp(0.5), 5);
  });

  it("zooms with Cmd and the wheel too, out as well as in", async () => {
    await measuredAsync(24);
    const zoom = instance().view().zoom;
    await wheelAsync({ deltaY: 50, metaKey: true });

    expect(instance().view().zoom).toBeCloseTo(zoom * Math.exp(-0.5), 5);
  });

  it("pans with the wheel, sideways with Shift where the system leaves it, and reads lines as 16px each", async () => {
    await measuredAsync(24);
    const start = view();
    const plain = await wheelAsync({ deltaY: 40 });
    const panned = view();
    await wheelAsync({ deltaY: 30, shiftKey: true });
    const sideways = view();
    await wheelAsync({ deltaX: 20, shiftKey: true });
    const turned = view();
    await wheelAsync({ deltaY: 2, deltaMode: WheelEvent.DOM_DELTA_LINE });

    expect([plain.defaultPrevented, panned.y - start.y, sideways.x - panned.x, turned.x - sideways.x, view().y - turned.y]).toEqual([true, -40, -30, -20, -32]);
  });

  it("reads a page-mode wheel as the canvas's height", async () => {
    await measuredAsync(24);
    const start = view();
    await wheelAsync({ deltaY: 1, deltaMode: WheelEvent.DOM_DELTA_PAGE });

    expect(start.y - view().y).toBe(canvas().getBoundingClientRect().height);
  });

  it("pans by dragging its background once the pointer moves 4px, and stops at its release", async () => {
    await measuredAsync(24);
    holdCapture(canvas());
    const frame = canvas().getBoundingClientRect();
    const start = view();
    pointer(canvas(), "pointerdown", 3, frame.right - 40, frame.top + 80);
    pointer(canvas(), "pointermove", 3, frame.right - 42, frame.top + 81);
    const still = [view(), canvas().classList.contains("nol-canvas-dragging")];
    pointer(canvas(), "pointermove", 3, frame.right - 60, frame.top + 100);
    await fixture.whenStable();
    const dragging = canvas().classList.contains("nol-canvas-dragging");
    pointer(canvas(), "pointerup", 3, frame.right - 60, frame.top + 100);
    await fixture.whenStable();

    expect([still, view().x - start.x, view().y - start.y, dragging, canvas().classList.contains("nol-canvas-dragging")]).toEqual([[start, false], -20, 20, true, false]);
  });

  it("never starts a pan from a control in its content or its toolbar, from another button, or for a pointer it doesn't hold", async () => {
    await measuredAsync(24);
    holdCapture(canvas());
    const start = view();
    const open = DomFixture.one(DomFixture.at(cards(), 0), ".open");
    const box = open.getBoundingClientRect();
    pointer(open, "pointerdown", 4, box.left + 2, box.top + 2);
    pointer(canvas(), "pointermove", 4, box.left + 40, box.top + 40);
    pointer(button("fit"), "pointerdown", 5, 10, 10);
    pointer(canvas(), "pointermove", 5, 60, 60);
    pointer(canvas(), "pointerdown", 6, 300, 300, 2);
    pointer(canvas(), "pointermove", 6, 360, 360);
    await fixture.whenStable();

    expect(view()).toEqual(start);
  });

  it("moves its dot grid with a pan, and lays its content out 1rem inside its plane", async () => {
    await measuredAsync(24);
    await wheelAsync({ deltaX: 17, deltaY: 23 });

    const [x, y] = getComputedStyle(canvas()).backgroundPosition.split(" ").map(t => Number.parseFloat(t));

    AppearanceFixture.expectPixels(x ?? Number.NaN, view().x);
    AppearanceFixture.expectPixels(y ?? Number.NaN, view().y);
    expect([getComputedStyle(plane()).paddingTop, getComputedStyle(plane()).paddingLeft]).toEqual([`${rootSize()}px`, `${rootSize()}px`]);
  });

  const endings: readonly (readonly [string, (pointerId: number, x: number, y: number) => void])[] = [
    ["a move with no button down", (pointerId, x, y) => {
      canvas().dispatchEvent(new PointerEvent("pointermove", { pointerId, buttons: 0, clientX: x, clientY: y, bubbles: true }));
    }],
    ["the loss of its pointer's capture", pointerId => {
      canvas().dispatchEvent(new PointerEvent("lostpointercapture", { pointerId, bubbles: true }));
    }],
    ["the window's loss of the focus", () => {
      window.dispatchEvent(new Event("blur"));
    }]
  ];
  for (const [ending, end] of endings)
    it(`stops a drag at ${ending}`, async () => {
      await measuredAsync(24);
      holdCapture(canvas());
      const frame = canvas().getBoundingClientRect();
      pointer(canvas(), "pointerdown", 21, frame.right - 40, frame.top + 80);
      pointer(canvas(), "pointermove", 21, frame.right - 60, frame.top + 100);
      await fixture.whenStable();
      const dragged = view();
      end(21, frame.right - 70, frame.top + 110);
      await fixture.whenStable();
      const ended = canvas().classList.contains("nol-canvas-dragging");
      pointer(canvas(), "pointermove", 21, frame.right - 90, frame.top + 130);

      expect([view(), ended]).toEqual([dragged, false]);
    });

  it("zooms with two pointers apart around their middle", async () => {
    await measuredAsync(24);
    holdCapture(canvas());
    const frame = canvas().getBoundingClientRect();
    const zoom = instance().view().zoom;
    pointer(canvas(), "pointerdown", 11, frame.left + 300, frame.top + 250);
    pointer(canvas(), "pointerdown", 12, frame.left + 340, frame.top + 250);
    pointer(canvas(), "pointermove", 12, frame.left + 380, frame.top + 250);
    await fixture.whenStable();
    const pinching = canvas().classList.contains("nol-canvas-dragging");
    pointer(canvas(), "pointerup", 12, frame.left + 380, frame.top + 250);
    pointer(canvas(), "pointercancel", 11, frame.left + 300, frame.top + 250);
    await fixture.whenStable();

    expect([instance().view().zoom / zoom, pinching, canvas().classList.contains("nol-canvas-dragging")]).toEqual([2, true, false]);
  });

  it("pans with the arrow keys by 3rem, zooms with plus and minus, and fits with 0, only while it has the focus itself", async () => {
    await measuredAsync(24);
    canvas().focus();
    const step = 3 * rootSize();
    const start = view();
    const moved = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].map(t => {
      const before = view();
      const event = key(canvas(), t);
      return [event.defaultPrevented, view().x - before.x, view().y - before.y];
    });
    const zoom = instance().view().zoom;
    const ratio = (): number => Math.round(instance().view().zoom / zoom * 1e6) / 1e6;
    key(canvas(), "+");
    const larger = ratio();
    key(canvas(), "-");
    const back = ratio();
    key(canvas(), "=");
    key(canvas(), "_");
    key(canvas(), "ArrowLeft");
    key(canvas(), "0");
    const fitted = view();
    const other = key(canvas(), "a");
    const fromChild = key(button("fit"), "ArrowLeft");

    expect([moved, larger, back, fitted, other.defaultPrevented, fromChild.defaultPrevented, view()])
      .toEqual([[[true, step, 0], [true, 0, step], [true, -step, 0], [true, 0, -step]], 1.2, 1, start, false, false, start]);
  });

  it("leaves its keys to the page with Ctrl, Alt or Cmd held", async () => {
    await measuredAsync(24);
    canvas().focus();
    const start = view();
    const presses: readonly KeyboardEventInit[] = [{ key: "0", ctrlKey: true }, { key: "=", ctrlKey: true }, { key: "-", metaKey: true }, { key: "ArrowLeft", altKey: true }];
    const events = presses.map(press => {
      const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...press });
      canvas().dispatchEvent(event);
      return event.defaultPrevented;
    });

    expect([events, view()]).toEqual([[false, false, false, false], start]);
  });

  it("pans an item that takes the focus into its free area, and leaves the view alone for one already there or for its toolbar", async () => {
    await measuredAsync(24);
    [1, 2, 3, 4].forEach(() => button("zoom-in").click());
    await fixture.whenStable();
    const last = DomFixture.oneOf(DomFixture.at(cards(), 23), ".open", HTMLButtonElement);
    const first = DomFixture.oneOf(DomFixture.at(cards(), 0), ".open", HTMLButtonElement);
    instance().centreOn(new CanvasPoint(0, 0));
    last.focus();
    const drawn = inside(last.getBoundingClientRect(), free());
    await fixture.whenStable();
    const shown = [inside(last.getBoundingClientRect(), free()), canvas().scrollLeft, canvas().scrollTop];
    const settled = view();
    button("fit").focus();
    last.focus();
    await fixture.whenStable();
    const kept = view();
    first.focus();
    await fixture.whenStable();

    expect([drawn, shown, kept, inside(first.getBoundingClientRect(), free())]).toEqual([true, [true, 0, 0], settled, true]);
  });

  // Card 7's Open button, zoomed in and placed across the canvas's left edge, so only a sliver of it shows.
  const placeAcrossEdgeAsync = async (): Promise<HTMLButtonElement> => {
    await measuredAsync(24);
    [1, 2, 3, 4].forEach(() => button("zoom-in").click());
    await fixture.whenStable();
    const open = DomFixture.oneOf(DomFixture.at(cards(), 6), ".open", HTMLButtonElement);
    await acrossEdgeAsync(open);
    return open;
  };
  const acrossEdgeAsync = async (open: HTMLButtonElement): Promise<void> => {
    instance().centreOn(new CanvasPoint(0, 0));
    await fixture.whenStable();
    const area = canvas().getBoundingClientRect();
    const start = open.getBoundingClientRect();
    const zoom = view().zoom;
    const dx = area.left + canvas().clientLeft - start.width * 0.4 - start.left;
    const dy = area.top + area.height / 2 - start.height / 2 - start.top;
    instance().centreOn(new CanvasPoint(-dx / zoom, -dy / zoom));
    await fixture.whenStable();
  };

  it("activates a control a press lands on and leaves it under the pointer, though it reaches past the free area, and still pans one the keyboard focuses into view", async () => {
    const open = await placeAcrossEdgeAsync();
    const above = DomFixture.oneOf(DomFixture.at(cards(), 5), ".open", HTMLButtonElement);
    const area = canvas().getBoundingClientRect();
    const placed = open.getBoundingClientRect();
    const before = view();

    await userEvent.click(open, { position: { x: area.left + canvas().clientLeft + 2 - placed.left, y: placed.height / 2 } });
    await fixture.whenStable();
    const pressed = [host.opened(), document.activeElement === open, view()];
    const after = open.getBoundingClientRect();
    await userEvent.tab({ shift: true });
    await fixture.whenStable();
    const reached = above.getBoundingClientRect();

    expect(placed.left).toBeLessThan(area.left);
    expect(placed.right).toBeGreaterThan(area.left + 2);
    expect(pressed).toEqual([[7], true, before]);
    AppearanceFixture.expectPixels(after.left, placed.left);
    AppearanceFixture.expectPixels(after.top, placed.top);
    expect(document.activeElement).toBe(above);
    expect(view()).not.toEqual(before);
    expect(inside(reached, free())).toBe(true);
  });

  it("activates a control a touch tap or a pen press lands on and leaves it under the finger or pen, though it reaches past the free area", async () => {
    const open = await placeAcrossEdgeAsync();
    const placed = open.getBoundingClientRect();
    const x = canvas().getBoundingClientRect().left + canvas().clientLeft + 2;
    const y = placed.top + placed.height / 2;
    const before = view();

    // What the page says of its pointer, which the spec files after this one on the page read, as a message showing its actions without a hover.
    const input = (): unknown[] => [matchMedia("(hover: hover)").matches, matchMedia("(any-hover: hover)").matches, matchMedia("(pointer: fine)").matches,
      navigator.maxTouchPoints];
    const inputBefore = input();
    let tapped: unknown[] = [];
    let tappedLeft = Number.NaN;
    let pressed: unknown[] = [];
    try {
      await tapAsync(x, y);
      await vi.waitFor(() => expect(host.opened()).toEqual([7]), HangLimitFixture.wait);
      await fixture.whenStable();
      tapped = [document.activeElement === open, view()];
      tappedLeft = open.getBoundingClientRect().left;
      open.blur();
      await penAsync(x, y);
      await vi.waitFor(() => expect(host.opened()).toEqual([7, 7]), HangLimitFixture.wait);
      await fixture.whenStable();
      pressed = [document.activeElement === open, view()];
    }
    finally {
      await awayAsync();
    }

    expect(placed.left).toBeLessThan(x - 2);
    expect(tapped).toEqual([true, before]);
    AppearanceFixture.expectPixels(tappedLeft, placed.left);
    expect(pressed).toEqual([true, before]);
    expect(input()).toEqual(inputBefore);
    AppearanceFixture.expectPixels(open.getBoundingClientRect().left, placed.left);
  });

  it("leaves a card a touch tap focuses under the finger, though the canvas holds the pointer the tap's pointerup comes to", async () => {
    const open = await placeAcrossEdgeAsync();
    const card = DomFixture.at(cards(), 6);
    card.tabIndex = -1;
    const area = canvas().getBoundingClientRect();
    const x = area.left + canvas().clientLeft + 2;
    const shown = card.getBoundingClientRect();
    const placed = open.getBoundingClientRect();
    const before = view();

    let tapped: unknown[] = [];
    try {
      await tapAsync(x, shown.bottom - 4);
      await vi.waitFor(() => expect(document.activeElement).toBe(card), HangLimitFixture.wait);
      await fixture.whenStable();
      tapped = [host.opened(), view()];
    }
    finally {
      await awayAsync();
    }

    expect(shown.left).toBeLessThan(area.left);
    expect(placed.bottom).toBeLessThan(shown.bottom - 4);
    expect(shown.bottom - 4).toBeLessThan(area.bottom);
    expect(tapped).toEqual([[], before]);
  });

  it("activates a control under a touch tap that moves past the canvas's drag start but within the browser's tap distance, and leaves it under the finger", async () => {
    const open = await placeAcrossEdgeAsync();
    const placed = open.getBoundingClientRect();
    const x = canvas().getBoundingClientRect().left + canvas().clientLeft + 2;
    const moved = DragGesture.threshold * 2;

    let movedBy = Number.NaN;
    let focused = false;
    try {
      await tapAsync(x, placed.top + placed.height / 2, moved);
      await vi.waitFor(() => expect(host.opened()).toEqual([7]), HangLimitFixture.wait);
      await fixture.whenStable();
      movedBy = open.getBoundingClientRect().left - placed.left;
      focused = document.activeElement === open;
    }
    finally {
      await awayAsync();
    }

    expect(focused).toBe(true);
    // A press on a control never drags the canvas, so only a pan for the focus could move the button.
    AppearanceFixture.expectPixels(movedBy, 0);
  });

  it("pans a control a program focuses into view once no click can follow a press on it: cancelled, slid off, dragged, held for its menu, released, or a key after it", async () => {
    const open = await placeAcrossEdgeAsync();
    const card = DomFixture.at(cards(), 6);
    card.tabIndex = -1;
    holdCapture(canvas());
    const placed = open.getBoundingClientRect();
    const x = placed.left + 2;
    const y = placed.top + placed.height / 2;
    // Presses the target and ends the press as `end` does, then has the program focus `focused`, which a press it didn't end keeps in place.
    const pannedAsync = async (target: HTMLElement, focused: HTMLElement, end: () => void): Promise<boolean> => {
      focused.blur();
      await acrossEdgeAsync(open);
      pointer(target, "pointerdown", 31, x, y);
      end();
      await fixture.whenStable();
      const ended = view();
      focused.focus();
      await fixture.whenStable();
      return view().x !== ended.x;
    };

    const cancelled = await pannedAsync(open, open, () => pointer(open, "pointercancel", 31, x, y));
    const slid = await pannedAsync(open, open, () => pointer(open, "pointerup", 31, x + DragGesture.threshold + 20, y));
    const dragged = await pannedAsync(card, card, () => {
      pointer(canvas(), "pointermove", 31, x - 40, y);
      pointer(canvas(), "pointerup", 31, x - 40, y);
    });
    const held = await pannedAsync(open, open, () => {
      open.dispatchEvent(new MouseEvent("contextmenu", { clientX: x, clientY: y, bubbles: true, cancelable: true }));
      pointer(open, "pointerup", 31, x, y);
    });
    const mouse = (type: string): boolean => open.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true, cancelable: true }));
    const released = await pannedAsync(open, open, () => {
      mouse("mousedown");
      mouse("mouseup");
    });
    const keyed = await pannedAsync(open, open, () => {
      mouse("mousedown");
      key(canvas(), "Shift");
    });

    expect([cancelled, slid, dragged, held, released, keyed]).toEqual([true, true, true, true, true, true]);
  });

  it("keeps an overlay anchored to an item against it through a focus reveal, a keyboard pan and a zoom, and loses it once a pan takes the item out of its free area", async () => {
    await measuredAsync(24);
    [1, 2, 3, 4].forEach(() => button("zoom-in").click());
    await fixture.whenStable();
    instance().centreOn(new CanvasPoint(0, 0));
    await fixture.whenStable();
    const item = DomFixture.at(cards(), 23);
    const overlay = new AnchoredOverlay(fixture.debugElement.injector.get(Injector), "nol-test-pane");
    let losses = 0;
    overlay.originLost.subscribe(() => losses++);
    overlay.openComponent(new ComponentPortal(OverlayContentComponent), item, new OverlayAnchoring(OverlaySide.below, OverlayAlignment.Start, 8));
    const placed = (): number[] => {
      const anchor = item.getBoundingClientRect();
      const pane = overlay.element.getBoundingClientRect();
      return [Math.round(pane.left - anchor.left) + 0, Math.round(pane.top >= anchor.bottom ? pane.top - anchor.bottom : anchor.top - pane.bottom)];
    };
    try {
      DomFixture.oneOf(item, ".open", HTMLButtonElement).focus();
      await fixture.whenStable();
      const revealed = placed();
      canvas().focus();
      key(canvas(), "ArrowRight");
      await fixture.whenStable();
      const panned = placed();
      key(canvas(), "+");
      await fixture.whenStable();
      const zoomed = placed();
      const lossesBefore = losses;
      instance().centreOn(new CanvasPoint(-5000, -5000));
      await fixture.whenStable();

      expect([revealed, panned, zoomed, lossesBefore, losses]).toEqual([[0, 8], [0, 8], [0, 8], 0, 1]);
    }
    finally {
      overlay.dispose();
    }
  });

  it("draws the pan to a focused item before the browser scrolls it into view, so a scrolling page around it stays put", async () => {
    await measuredAsync(24);
    const page = DomFixture.host(fixture);
    const spacer = document.createElement("div");
    spacer.style.height = "100rem";
    page.append(spacer);
    page.style.display = "block";
    page.style.overflow = "auto";
    page.style.height = `${canvas().offsetHeight}px`;
    page.style.width = `${canvas().offsetWidth + 2 * rootSize()}px`;
    [1, 2, 3, 4].forEach(() => button("zoom-in").click());
    await fixture.whenStable();
    DomFixture.oneOf(DomFixture.at(cards(), 23), ".open", HTMLButtonElement).focus();

    expect(page.scrollTop).toBe(0);
  });

  it("zooms in and out by 1.2 times from its toolbar, back to 100%, and fits again, around the canvas's middle", async () => {
    await measuredAsync(24);
    const fitted = view();
    const zoom = instance().view().zoom;
    const ratio = (): number => Math.round(instance().view().zoom / zoom * 1e6) / 1e6;
    button("zoom-in").click();
    const larger = ratio();
    button("zoom-out").click();
    button("zoom-out").click();
    const smaller = ratio();
    button("actual").click();
    const actual = instance().view().zoom;
    await fixture.whenStable();
    const label = zoomText();
    button("fit").click();

    expect([larger, smaller, actual, label, view()]).toEqual([1.2, 0.833333, 1, "100%", fitted]);
    expect([button("zoom-in"), button("zoom-out")].map(t => t.getAttribute("aria-label"))).toEqual(["Zoom in", "Zoom out"]);
  });

  it("names its toolbar and labels its map toggle Hide while the map shows", async () => {
    await measuredAsync(24);

    expect([tools().getAttribute("role"), tools().getAttribute("aria-label"), button("map-toggle").getAttribute("aria-label"), button("map-toggle").getAttribute("aria-pressed")])
      .toEqual(["toolbar", "Canvas view", "Hide the overview map", "true"]);
    expect([map().getAttribute("role"), map().getAttribute("aria-label"), map().tabIndex]).toEqual(["button", "Overview map: click a spot to move there", 0]);
  });

  it("wraps its hint below the toolbar on a narrow canvas, and fits its items below both", async () => {
    host.cards.set([1, 2, 3]);
    await measuredAsync(3);
    canvas().style.width = "20rem";
    await DomChangeFixture.untilAsync(() => expect(hint().getBoundingClientRect().top).toBeGreaterThanOrEqual(tools().getBoundingClientRect().bottom));
    await DomChangeFixture.untilAsync(() => expect(Number(mapView().getAttribute("width")) * instance().view().zoom).toBeCloseTo(canvas().clientWidth, 3));
    instance().fit();
    await fixture.whenStable();
    const frame = canvas().getBoundingClientRect();
    const toolbar = tools().getBoundingClientRect();
    const tip = hint().getBoundingClientRect();

    expect(cards().map(t => t.getBoundingClientRect()).filter(t => t.top < tip.bottom || t.left < frame.left || t.right > frame.right)).toEqual([]);
    AppearanceFixture.expectPixels(tip.top - toolbar.bottom, AppearanceFixture.measureLook("space-1"));
    AppearanceFixture.expectPixels(tip.left - frame.left, AppearanceFixture.measureLook("space-2") + AppearanceFixture.measureLook("border-width"));
  });

  it("fits with Enter or Space on its map, and leaves other keys there alone", async () => {
    await measuredAsync(24);
    const fitted = view();
    [1, 2].forEach(() => button("zoom-in").click());
    const enter = key(map(), "Enter");
    const afterEnter = view();
    button("zoom-in").click();
    const space = key(map(), " ");
    const afterSpace = view();
    button("zoom-in").click();
    const zoomed = view();
    const other = key(map(), "a");

    expect([enter.defaultPrevented, afterEnter, space.defaultPrevented, afterSpace, other.defaultPrevented, view()]).toEqual([true, fitted, true, fitted, false, zoomed]);
  });

  it("centres a point the caller names", async () => {
    await measuredAsync(24);
    instance().centreOn(new CanvasPoint(100, 50));
    const shown = instance().view();
    const frame = canvas();

    expect([shown.x + 100 * shown.zoom, shown.y + 50 * shown.zoom]).toEqual([frame.clientWidth / 2, frame.clientHeight / 2]);
  });

  it("rounds its map's boxes by 1px and its view rectangle by 0.125rem on screen", async () => {
    await measuredAsync(24);
    const svg = DomFixture.oneOf(map(), "svg", SVGSVGElement);
    const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
    const radius = (element: SVGRectElement): number => Number(element.getAttribute("rx")) * scale;

    AppearanceFixture.expectPixels(radius(DomFixture.oneOf(map(), ".nol-canvas-map-box", SVGRectElement)), rootSize() / 16);
    AppearanceFixture.expectPixels(radius(mapView()), rootSize() / 8);
  });

  it("draws its map's view rectangle in the canvas's proportions", async () => {
    await measuredAsync(24);
    button("zoom-in").click();
    button("zoom-in").click();
    await fixture.whenStable();
    const drawn = mapView().getBoundingClientRect();
    const frame = DomFixture.oneOf(map(), "svg", SVGSVGElement).getAttribute("viewBox");
    await wheelAsync({ deltaX: 200, deltaY: 200 });

    expect(drawn.width / drawn.height).toBeCloseTo(canvas().clientWidth / canvas().clientHeight, 1);
    expect([DomFixture.oneOf(map(), "svg", SVGSVGElement).getAttribute("viewBox"), frame]).toEqual([`0 0 ${plane().offsetWidth} ${plane().offsetHeight}`, `0 0 ${plane().offsetWidth} ${plane().offsetHeight}`]);
  });

  it("centres the spot clicked on its map, and pans as the map's rectangle is dragged", async () => {
    await measuredAsync(24);
    holdCapture(map());
    [1, 2, 3].forEach(() => button("zoom-in").click());
    await fixture.whenStable();
    const overview = map().getBoundingClientRect();
    const content = DomFixture.oneOf(map(), "svg", SVGSVGElement).viewBox.baseVal;
    const spot = [content.x + (overview.width - 2) / overview.width * content.width, content.y + (overview.height - 2) / overview.height * content.height];
    pointer(map(), "pointerdown", 21, overview.right - 2, overview.bottom - 2);
    pointer(map(), "pointerup", 21, overview.right - 2, overview.bottom - 2);
    await fixture.whenStable();
    const shown = instance().view().visible(canvas().clientWidth, canvas().clientHeight);
    const centre = [shown.left + shown.width / 2, shown.top + shown.height / 2];
    const drawn = mapView().getBoundingClientRect();
    const before = view();
    pointer(map(), "pointerdown", 22, drawn.left + drawn.width / 2, drawn.top + drawn.height / 2);
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 22, buttons: 1, clientX: drawn.left + drawn.width / 2 - 10, clientY: drawn.top + drawn.height / 2 }));
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 22, buttons: 1, clientX: drawn.left + drawn.width / 2 - 10, clientY: drawn.top + drawn.height / 2 }));
    document.dispatchEvent(new PointerEvent("pointerup", { pointerId: 22 }));
    await fixture.whenStable();

    expect(centre.map((t, i) => Math.abs(t - DomFixture.at(spot, i)) < 1)).toEqual([true, true]);
    expect([view().x > before.x, view().y]).toEqual([true, before.y]);
  });

  it("leaves its map to a press of another button", async () => {
    await measuredAsync(24);
    button("zoom-in").click();
    button("zoom-in").click();
    const before = view();
    const overview = map().getBoundingClientRect();
    pointer(map(), "pointerdown", 23, overview.left + 2, overview.top + 2, 2);

    expect(view()).toEqual(before);
  });

  it("stops following a drag on its map once the system cancels the pointer", async () => {
    await measuredAsync(24);
    holdCapture(map());
    [1, 2, 3].forEach(() => button("zoom-in").click());
    await fixture.whenStable();
    const drawn = mapView().getBoundingClientRect();
    const [x, y] = [drawn.left + drawn.width / 2, drawn.top + drawn.height / 2];
    pointer(map(), "pointerdown", 24, x, y);
    document.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 24 }));
    const before = view();
    document.dispatchEvent(new PointerEvent("pointermove", { pointerId: 24, buttons: 1, clientX: x - 10, clientY: y }));

    expect(view()).toEqual(before);
  });

  it("fits once it is first shown with content, not while it is hidden or empty", async () => {
    fixture.destroy();
    fixture = TestBed.createComponent(CanvasHostComponent);
    host = fixture.componentInstance;
    host.hidden.set(true);
    host.cards.set([]);
    fixture.detectChanges();
    await fixture.whenStable();
    const hidden = zoomText();
    host.hidden.set(false);
    await measuredAsync(0);
    const empty = zoomText();
    host.cards.set(Array.from({ length: 24 }, (_, t) => t + 1));
    await measuredAsync(24);

    expect([hidden, empty, instance().view().zoom < 1]).toEqual(["100%", "100%", true]);
  });

  it("stops handling the wheel once destroyed", async () => {
    await measuredAsync(24);
    const element = canvas();
    fixture.destroy();
    const event = new WheelEvent("wheel", { deltaY: 10, cancelable: true });
    element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });
});

@Component({
  selector: "nol-canvas-spec-team",
  imports: [CanvasItemDirective],
  host: { "[style.display]": "'flex'", "[style.gap.rem]": "1" },
  template: `
    @for (name of names(); track name) {
      <div nolCanvasItem class="member" [style.width.rem]="name === wide() ? 12 : 8" [style.height.rem]="3">{{ name }}</div>
    }
  `
})
class TeamComponent {
  public readonly names = input.required<readonly string[]>();
  public readonly wide = input<string>("");
}

@Component({
  imports: [CanvasComponent, CanvasItemDirective, TeamComponent],
  template: `
    <nol-canvas class="outer" label="Team" [style.width.px]="800" [style.height.px]="500">
      <div [style.display]="'flex'" [style.gap.rem]="1" [style.align-items]="'flex-start'">
        <nol-canvas-spec-team [names]="names()" [wide]="wide()" />
        @if (lead()) {
          <div nolCanvasItem class="lead" [style.width.rem]="10" [style.height.rem]="3">Lead</div>
        }
        @if (inner()) {
          <nol-canvas class="inner" label="Inner" [style.width.px]="300" [style.height.px]="200">
            <div nolCanvasItem class="inside" [style.width.rem]="4" [style.height.rem]="2">In</div>
          </nol-canvas>
        }
      </div>
    </nol-canvas>
    <div nolCanvasItem class="outside">Outside</div>
  `
})
class NestedCanvasHostComponent {
  public readonly names = signal<readonly string[]>(["Alice", "Bob"]);
  public readonly wide = signal("");
  public readonly lead = signal(false);
  public readonly inner = signal(false);
}

describe("CanvasComponent with items inside its content's components", () => {
  let fixture: ComponentFixture<NestedCanvasHostComponent>;
  let rem: number;

  const host = (): NestedCanvasHostComponent => fixture.componentInstance;
  const canvas = (name: string = "outer"): HTMLElement => DomFixture.one(DomFixture.host(fixture), `nol-canvas.${name}`);
  const boxes = (name: string = "outer"): SVGRectElement[] => DomFixture.allOf(DomFixture.one(canvas(name), ":scope > nol-canvas-map"), ".nol-canvas-map-box", SVGRectElement);
  const size = (width: number, height: number = 3): string => `${width * rem}x${height * rem}`;
  const sizes = (name: string = "outer"): string[] => boxes(name).map(t => `${t.getAttribute("width")}x${t.getAttribute("height")}`).sort();
  const widthsAcross = (): number[] => boxes().map(t => ({ x: Number(t.getAttribute("x")), width: Number(t.getAttribute("width")) / rem }))
    .sort((a, b) => a.x - b.x).map(t => t.width);
  const changedAsync = async (check: () => void): Promise<void> => {
    fixture.detectChanges();
    await fixture.whenStable();
    await DomChangeFixture.untilAsync(check);
  };

  beforeEach(async () => {
    AppearanceFixture.apply();
    rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
    fixture = TestBed.createComponent(NestedCanvasHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  it("shows on its map the items marked inside a component of its content, and each added or removed later, but none outside it", async () => {
    await changedAsync(() => expect(sizes()).toEqual([size(8), size(8)]));
    host().lead.set(true);
    await changedAsync(() => expect(sizes()).toEqual([size(10), size(8), size(8)].sort()));
    host().names.set(["Alice"]);
    await changedAsync(() => expect(sizes()).toEqual([size(10), size(8)].sort()));
    host().lead.set(false);
    host().names.set(["Alice", "Bob", "Carol"]);
    await changedAsync(() => expect(sizes()).toEqual([size(8), size(8), size(8)]));
  });

  it("moves an item's box when the content reorders its items, and resizes it when the item resizes", async () => {
    host().wide.set("Alice");
    await changedAsync(() => expect(widthsAcross()).toEqual([12, 8]));
    host().names.set(["Bob", "Alice"]);
    await changedAsync(() => expect(widthsAcross()).toEqual([8, 12]));
    host().wide.set("Bob");

    await changedAsync(() => expect(widthsAcross()).toEqual([12, 8]));
  });

  it("leaves the items of a canvas inside it to that canvas's own map", async () => {
    host().inner.set(true);
    await changedAsync(() => expect(sizes("inner")).toEqual([size(4, 2)]));

    expect(sizes()).toEqual([size(8), size(8)]);
  });

  it("measures its items once a frame for a burst of changes, and keeps its map's boxes when none of them moved", async () => {
    await changedAsync(() => expect(sizes()).toEqual([size(8), size(8)]));
    await RenderedFrameFixture.nextAsync();
    const plane = DomFixture.one(canvas(), ".nol-canvas-plane");
    const content = DomFixture.one(plane, ":scope > div");
    const map = fixture.debugElement.query(By.directive(CanvasMapComponent)).injector.get(CanvasMapComponent);
    const before = map.boxes();
    const measures = vi.spyOn(plane, "getBoundingClientRect");
    for (let changes = 0; changes < 20; changes++) {
      const hidden = document.createElement("span");
      hidden.hidden = true;
      content.append(hidden);
      await Promise.resolve();
    }
    await RenderedFrameFixture.nextAsync();
    await RenderedFrameFixture.nextAsync();

    expect(measures).toHaveBeenCalledTimes(1);
    expect(map.boxes()).toBe(before);
  });

  it("measures its items at the zoom it draws, even when the view zooms in the frame before its measure", async () => {
    await changedAsync(() => expect(sizes()).toEqual([size(8), size(8)]));
    await RenderedFrameFixture.nextAsync();
    const zoom = (): number => fixture.debugElement.query(By.directive(CanvasComponent)).injector.get(CanvasComponent).view().zoom;
    const before = zoom();
    const zoomed = new Promise<void>(resolve => requestAnimationFrame(() => {
      DomFixture.oneOf(canvas(), ".nol-canvas-zoom-in", HTMLButtonElement).click();
      resolve();
    }));
    const hidden = document.createElement("span");
    hidden.hidden = true;
    DomFixture.one(canvas(), ".nol-canvas-plane > div").append(hidden);
    await zoomed;
    await RenderedFrameFixture.nextAsync();
    await RenderedFrameFixture.nextAsync();

    expect([Math.round(zoom() / before * 1000) / 1000, widthsAcross().map(t => Math.round(t * 1000) / 1000)]).toEqual([1.2, [8, 8]]);
  });

  it("measures nothing once it is destroyed with a measure still waiting for its frame", async () => {
    await changedAsync(() => expect(sizes()).toEqual([size(8), size(8)]));
    await RenderedFrameFixture.nextAsync();
    const plane = DomFixture.one(canvas(), ".nol-canvas-plane");
    const measures = vi.spyOn(plane, "getBoundingClientRect");
    DomFixture.one(plane, ":scope > div").append(document.createElement("span"));
    await Promise.resolve();
    fixture.destroy();
    await RenderedFrameFixture.nextAsync();

    expect(measures).not.toHaveBeenCalled();
  });

  it("leaves off its map an item declared inside it once the item is rendered outside its plane", async () => {
    host().lead.set(true);
    await changedAsync(() => expect(sizes()).toHaveLength(3));
    DomFixture.host(fixture).append(DomFixture.one(canvas(), ".lead"));

    await changedAsync(() => expect(sizes()).toEqual([size(8), size(8)]));
  });
});

@Component({
  imports: [CanvasComponent, CanvasItemDirective],
  template: `
    <nol-canvas label="Organization" [style.width.px]="800" [style.height.px]="500" [dotSize]="size()" [dotGap]="gap()" [dotColor]="color()">
      <div nolCanvasItem [style.width.rem]="12" [style.height.rem]="5">Design</div>
    </nol-canvas>
  `
})
class DotsCanvasHostComponent {
  public readonly size = signal("0.5px");
  public readonly gap = signal("1rem");
  public readonly color = signal("rgb(255, 0, 0)");
}

describe("CanvasComponent with its dots bound", () => {
  let fixture: ComponentFixture<DotsCanvasHostComponent>;

  const canvas = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-canvas");
  const instance = (): CanvasComponent => fixture.debugElement.query(By.directive(CanvasComponent)).injector.get(CanvasComponent);
  const rootSize = (): number => Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  const grid = (): readonly string[] => [getComputedStyle(canvas()).backgroundImage, getComputedStyle(canvas()).backgroundSize];

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(DotsCanvasHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(async () => {
    fixture.destroy();
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  it("draws its grid with the dot size, gap and color it is given, the same at every zoom", async () => {
    await DomChangeFixture.untilAsync(() => expect(DomFixture.allOf(canvas(), ".nol-canvas-map-box", SVGRectElement)).toHaveLength(1));
    const drawn = grid();
    const bounds = canvas().getBoundingClientRect();
    canvas().dispatchEvent(new WheelEvent("wheel", { clientX: bounds.left + bounds.width / 2, clientY: bounds.top + bounds.height / 2, deltaY: -100, ctrlKey: true, bubbles: true, cancelable: true }));
    await DomChangeFixture.untilAsync(() => expect(instance().view().zoom).not.toBe(1));

    expect([drawn, grid()]).toEqual([["radial-gradient(rgb(255, 0, 0) 0.5px, rgba(0, 0, 0, 0) 0.5px)", `${String(rootSize())}px ${String(rootSize())}px`], drawn]);
  });

  it("redraws its grid when its dot size, gap or color changes", async () => {
    fixture.componentInstance.size.set("2px");
    fixture.componentInstance.gap.set("3rem");
    fixture.componentInstance.color.set("rgb(0, 0, 255)");
    fixture.detectChanges();
    await fixture.whenStable();

    expect(grid()).toEqual(["radial-gradient(rgb(0, 0, 255) 2px, rgba(0, 0, 0, 0) 2px)", `${String(rootSize() * 3)}px ${String(rootSize() * 3)}px`]);
  });

  it("draws no grid under forced colors, whatever dots it is given", async () => {
    await ForcedColorsFixture.activateAsync();

    expect(getComputedStyle(canvas()).backgroundImage).toBe("none");
  });
});
