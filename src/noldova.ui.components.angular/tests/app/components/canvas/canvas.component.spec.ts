/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, computed, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { CanvasItemDirective } from "../../../../src/app/components/canvas/canvas-item.directive";
import { CanvasComponent } from "../../../../src/app/components/canvas/canvas.component";
import { CanvasFitAlignment } from "../../../../src/app/enums/canvas-fit-alignment";
import { CanvasPoint } from "../../../../src/app/models/canvas-point";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [CanvasComponent, CanvasItemDirective],
  template: `
    <div [hidden]="hidden()">
      <nol-canvas label="Organization" [style.width.px]="800" [style.height.px]="500" [(mapShown)]="mapShown" [fitAlignment]="alignment()">
        @if (cards().length > 0) {
          <div [style.display]="'grid'" [style.grid-template-columns]="'repeat(' + columns() + ', 12rem)'" [style.gap.rem]="1" [style.padding.rem]="1">
            @for (card of cards(); track card) {
              <div nolCanvasItem class="card" [style.height.rem]="5">{{ card }} <button type="button" class="open">Open</button></div>
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
        expect(getComputedStyle(canvas()).backgroundImage).toContain(AppearanceFixture.readColor(theme, mode, "menu-border"));
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
    instance().centreOn(new CanvasPoint(0, 0));
    await fixture.whenStable();
    const free = (): DOMRect => {
      const inset = band().offsetTop;
      const top = band().getBoundingClientRect().bottom + inset;
      const bottom = map().getBoundingClientRect().bottom - 7 * rootSize() - inset;
      return new DOMRect(canvas().getBoundingClientRect().left + canvas().clientLeft + inset, top, canvas().clientWidth - inset * 2, bottom - top);
    };
    const inside = (box: DOMRect, area: DOMRect): boolean =>
      box.left >= area.left - 2 && box.top >= area.top - 2 && box.right <= area.right + 2 && box.bottom <= area.bottom + 2;
    const last = DomFixture.oneOf(DomFixture.at(cards(), 23), ".open", HTMLButtonElement);
    const first = DomFixture.oneOf(DomFixture.at(cards(), 0), ".open", HTMLButtonElement);
    const away = inside(last.getBoundingClientRect(), free());
    last.focus();
    await fixture.whenStable();
    const shown = [inside(last.getBoundingClientRect(), free()), canvas().scrollLeft, canvas().scrollTop];
    const settled = view();
    button("fit").focus();
    last.focus();
    await fixture.whenStable();
    const kept = view();
    first.focus();
    await fixture.whenStable();

    expect([away, shown, kept, inside(first.getBoundingClientRect(), free())]).toEqual([false, [true, 0, 0], settled, true]);
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
