/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ComponentPortal, TemplatePortal } from "@angular/cdk/portal";
import { ApplicationRef, Component, Injector, type TemplateRef, ViewContainerRef, inject, signal, viewChild } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { OverlayAlignment } from "../../../src/app/enums/overlay-alignment";
import { ClockTokens } from "../../../src/app/models/clock-tokens";
import { ContentMovedEvent } from "../../../src/app/models/content-moved-event";
import { OverlayAnchoring } from "../../../src/app/models/overlay-anchoring";
import { OverlaySide } from "../../../src/app/models/overlay-side";
import { ResizeTokens } from "../../../src/app/models/resize-tokens";
import { AnchoredOverlay } from "../../../src/app/services/anchored-overlay";
import { AppearanceFixture } from "../../../src/testing/services/appearance-fixture";
import { ChangeSignalFixture } from "../../fixtures/change-signal.fixture";
import { DomChangeFixture } from "../../fixtures/dom-change.fixture";
import { DomFixture } from "../../fixtures/dom.fixture";
import { RecordingResizeObserversFixture } from "../../fixtures/recording-resize-observers.fixture";
import { TestTimeSource } from "../../fixtures/test-time-source";

@Component({
  template: `<div class="content" [style.width.px]="120" [style.height.px]="height()"></div>`
})
class ContentComponent {
  public readonly height = signal(40);
}

class SideCase {
  public constructor(public readonly name: string, public readonly side: OverlaySide) {
  }
}

class EdgeCase {
  public constructor(public readonly name: string, public readonly move: (anchor: HTMLElement) => void) {
  }
}

class ResizeEntry implements ResizeObserverEntry {
  public readonly borderBoxSize: readonly ResizeObserverSize[];
  public readonly contentBoxSize: readonly ResizeObserverSize[];
  public readonly devicePixelContentBoxSize: readonly ResizeObserverSize[];
  public readonly contentRect: DOMRectReadOnly;
  public readonly target: Element;

  public constructor(inlineSize: number, blockSize: number) {
    this.borderBoxSize = [{ inlineSize, blockSize }];
    this.contentBoxSize = this.borderBoxSize;
    this.devicePixelContentBoxSize = this.borderBoxSize;
    this.contentRect = new DOMRectReadOnly(0, 0, inlineSize, blockSize);
    this.target = document.body;
  }
}

@Component({
  template: `<p style="margin: 0; max-width: 320px;">{{ text() }}</p>`
})
class WrappingComponent {
  public readonly text = signal("");
}

@Component({
  template: `
    <div class="scroller" style="position: fixed; top: 0; left: 0; width: 600px; height: 400px; overflow: auto;">
      <button type="button" class="anchor" style="position: absolute; top: 200px; left: 200px; width: 60px; height: 24px;">{{ label() }}</button>
      <div style="height: 2000px;"></div>
    </div>
    <ng-template #panel><div class="panel" style="width: 80px; height: 30px;"></div></ng-template>
  `
})
class AnchorHostComponent {
  public readonly injector: Injector = inject(Injector);
  public readonly viewContainer: ViewContainerRef = inject(ViewContainerRef);
  public readonly panel = viewChild.required<TemplateRef<unknown>>("panel");
  public readonly label = signal("Anchor");
}

describe("AnchoredOverlay", () => {
  let fixture: ComponentFixture<AnchorHostComponent>;
  let overlay: AnchoredOverlay;

  beforeEach(async () => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(AnchorHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    overlay = new AnchoredOverlay(fixture.componentInstance.injector, "nol-test-pane");
  });

  afterEach(() => {
    overlay.dispose();
    fixture.destroy();
    AppearanceFixture.reset();
  });

  function anchor(): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), ".anchor");
  }

  function below(gap: number = 8): OverlayAnchoring {
    return new OverlayAnchoring(OverlaySide.below, OverlayAlignment.Start, gap);
  }

  it("places an attached component where its bounds put it and reports the placement", () => {
    const content = overlay.openComponent(new ComponentPortal(ContentComponent), anchor(), below());
    content.changeDetectorRef.detectChanges();
    overlay.reposition();
    const box = overlay.element.getBoundingClientRect();
    const target = anchor().getBoundingClientRect();

    expect(overlay.isOpen).toBe(true);
    expect(overlay.element.classList.contains("nol-test-pane")).toBe(true);
    expect([box.left, box.top]).toEqual([target.left, target.bottom + 8]);
    expect(overlay.placement?.side).toBe(OverlaySide.below);
  });

  it("reports read-only copies of its origin's box and its pane's as its last placement measured them, the pane's height limited to the room it has, and none once closed", () => {
    const sides = (box: DOMRectReadOnly | undefined): readonly (number | undefined)[] => [box?.left, box?.top, box?.width, box?.height];
    const content = overlay.openComponent(new ComponentPortal(ContentComponent), anchor(), below());
    content.changeDetectorRef.detectChanges();
    overlay.reposition();
    const placed = overlay.placedBoxes;
    const boxes = [anchor().getBoundingClientRect(), overlay.element.getBoundingClientRect()];
    content.instance.height.set(5000);
    content.changeDetectorRef.detectChanges();
    overlay.reposition();
    const limited = overlay.placedBoxes?.pane;
    const pane = overlay.element.getBoundingClientRect();
    const limit = overlay.placement?.maxHeight;
    overlay.close();

    expect([sides(placed?.origin), sides(placed?.pane)]).toEqual(boxes.map(sides));
    expect([placed?.origin, placed?.pane].map(t => Object.getPrototypeOf(t) === DOMRectReadOnly.prototype)).toEqual([true, true]);
    expect([sides(limited), limit]).toEqual([sides(pane), pane.height]);
    expect(overlay.placedBoxes).toBeNull();
  });

  it("places an attached template by an area it is given instead of its origin's box, and follows it again when asked", () => {
    const host = fixture.componentInstance;
    overlay.overlayRef.attach(new TemplatePortal(host.panel(), host.viewContainer));
    overlay.follow(anchor(), below(0), () => new DOMRect(300, 150, 0, 0));
    const first = overlay.element.getBoundingClientRect();
    overlay.follow(anchor(), below(0));
    const second = overlay.element.getBoundingClientRect();
    const target = anchor().getBoundingClientRect();

    expect([first.left, first.top]).toEqual([300, 150]);
    expect([second.left, second.top]).toEqual([target.left, target.bottom]);
    expect(overlay.element.querySelector(".panel")).not.toBeNull();
  });

  it("follows its anchor when the window resizes and its content when it grows, and limits its height to the room it has", async () => {
    const content = overlay.openComponent(new ComponentPortal(ContentComponent), anchor(), below());
    content.changeDetectorRef.detectChanges();
    overlay.reposition();

    anchor().style.left = "240px";
    window.dispatchEvent(new Event("resize"));
    expect(overlay.element.getBoundingClientRect().left).toBe(anchor().getBoundingClientRect().left);

    content.instance.height.set(5000);
    content.changeDetectorRef.detectChanges();
    await DomChangeFixture.untilAsync(() => expect(overlay.placement?.maxHeight ?? 0).toBeGreaterThan(0));
    const limit = overlay.placement?.maxHeight ?? 0;

    expect(overlay.element.style.maxHeight).toBe(`${limit}px`);
  });

  it("moves to the place a size its content takes in a render puts it, within that render, and leaves a render that keeps its size alone", () => {
    const content = overlay.openComponent(new ComponentPortal(ContentComponent), anchor(), new OverlayAnchoring(OverlaySide.above, OverlayAlignment.Start, 8));
    content.changeDetectorRef.detectChanges();
    overlay.reposition();
    const application = TestBed.inject(ApplicationRef);
    const reposition = vi.spyOn(overlay, "reposition");
    application.tick();
    const kept = reposition.mock.calls.length;
    content.instance.height.set(100);
    application.tick();
    const box = overlay.element.getBoundingClientRect();

    expect([kept, reposition.mock.calls.length, box.height]).toEqual([0, 1, 100]);
    AppearanceFixture.expectPixels(box.bottom, anchor().getBoundingClientRect().top - 8);
  });

  it("reads no layout in a render that changes nothing in it, and measures itself again in one that does, or that follows a change made outside a render", async () => {
    const content = overlay.openComponent(new ComponentPortal(ContentComponent), anchor(), below());
    content.changeDetectorRef.detectChanges();
    overlay.reposition();
    const application = TestBed.inject(ApplicationRef);
    const measures = vi.spyOn(overlay.element, "getBoundingClientRect");
    const reposition = vi.spyOn(overlay, "reposition");
    const renderElsewhere = (label: string): void => {
      fixture.componentInstance.label.set(label);
      application.tick();
    };
    renderElsewhere("Kept");
    const kept = measures.mock.calls.length;
    content.instance.height.set(60);
    application.tick();
    const rendered = reposition.mock.calls.length;
    DomFixture.one(overlay.element, ".content").style.height = "80px";
    await Promise.resolve();
    renderElsewhere("Grown");

    expect([kept, measures.mock.calls.length > 0, rendered, reposition.mock.calls.length]).toEqual([0, true, 1, 2]);
  });

  it("measures itself once after a change made outside a render that keeps its size, and not in the renders after it", async () => {
    const content = overlay.openComponent(new ComponentPortal(ContentComponent), anchor(), below());
    content.changeDetectorRef.detectChanges();
    overlay.reposition();
    const application = TestBed.inject(ApplicationRef);
    const measures = vi.spyOn(overlay.element, "getBoundingClientRect");
    const reposition = vi.spyOn(overlay, "reposition");
    const renderElsewhere = (label: string): void => {
      fixture.componentInstance.label.set(label);
      application.tick();
    };
    DomFixture.one(overlay.element, ".content").classList.add("cdk-focused");
    await Promise.resolve();
    renderElsewhere("Focused");
    const changed = measures.mock.calls.length;
    renderElsewhere("Again");
    renderElsewhere("Once more");

    expect([changed, measures.mock.calls.length - changed, reposition.mock.calls.length]).toEqual([1, 0, 0]);
  });

  const sides = [new SideCase("above", OverlaySide.above), new SideCase("below", OverlaySide.below), new SideCase("start", OverlaySide.start), new SideCase("end", OverlaySide.end)];
  const edges = [
    new EdgeCase("left", t => Object.assign(t.style, { left: "4px", top: "300px" })),
    new EdgeCase("right", t => Object.assign(t.style, { left: `${window.innerWidth - 64}px`, top: "300px" })),
    new EdgeCase("top", t => Object.assign(t.style, { left: "400px", top: "4px" })),
    new EdgeCase("bottom", t => Object.assign(t.style, { left: "400px", top: `${window.innerHeight - 28}px` }))
  ];

  describe.each(sides)("on its $name side", ({ side }) => {
    it.each(edges)("paints at the size and place it settles at near the $name edge of the window", async ({ move }) => {
      const host = DomFixture.one(DomFixture.host(fixture), ".scroller");
      Object.assign(host.style, { width: "100vw", height: "100vh" });
      const target = anchor();
      move(target);
      const content = overlay.openComponent(new ComponentPortal(WrappingComponent), target, new OverlayAnchoring(side, OverlayAlignment.Center, 8));
      content.changeDetectorRef.detectChanges();
      content.instance.text.set("words that need room words that need room words that need room words that need room");
      content.changeDetectorRef.detectChanges();
      overlay.reposition();
      const first = overlay.element.getBoundingClientRect();

      await new Promise(t => requestAnimationFrame(() => requestAnimationFrame(t)));
      const settled = overlay.element.getBoundingClientRect();

      expect([first.left, first.top, first.width, first.height]).toEqual([settled.left, settled.top, settled.width, settled.height]);
      expect(first.width).toBeGreaterThan(0);
    });
  });

  it("asks for no reposition when its content's first observed size is the size it was placed at, and asks for one when that size changes", async () => {
    const source = new TestTimeSource();
    const timed = new AnchoredOverlay(Injector.create({ providers: [{ provide: ClockTokens.timeSource, useValue: source }], parent: fixture.componentInstance.injector }), "nol-test-pane");
    const framesAsync = async (): Promise<void> => {
      await new Promise(resolve => requestAnimationFrame(resolve));
      await new Promise(resolve => requestAnimationFrame(resolve));
    };
    try {
      timed.openComponent(new ComponentPortal(ContentComponent), anchor(), below());
      const content = DomFixture.one(timed.element, ".content");
      await framesAsync();
      const afterOpen = source.frameCount;
      content.style.height = "90px";
      await framesAsync();

      expect([afterOpen, source.frameCount]).toEqual([0, 1]);
    }
    finally {
      timed.dispose();
    }
  });

  it("drops a reposition its content asked for when it closes before the next frame", () => {
    const observers = new RecordingResizeObserversFixture();
    const source = new TestTimeSource();
    const providers = [{ provide: ClockTokens.timeSource, useValue: source }, { provide: ResizeTokens.observers, useValue: observers }];
    const timed = new AnchoredOverlay(Injector.create({ providers, parent: fixture.componentInstance.injector }), "nol-test-pane");
    try {
      timed.openComponent(new ComponentPortal(ContentComponent), anchor(), below());
      const reposition = vi.spyOn(timed, "reposition");

      const grown = [new ResizeEntry(1000, 1000)];
      observers.notify(grown);
      observers.notify(grown);
      const pending = source.frameCount;
      timed.close();
      source.runFrames();

      expect(pending).toBe(1);
      expect(reposition).not.toHaveBeenCalled();
      expect(timed.placement).toBeNull();
    }
    finally {
      timed.dispose();
    }
  });

  it("reports an ancestor scroll that moves its anchor, but not a scroll inside itself or elsewhere", async () => {
    let scrolls = 0;
    overlay.originLost.subscribe(() => scrolls++);
    overlay.openComponent(new ComponentPortal(ContentComponent), anchor(), below());
    const elsewhere = document.body.appendChild(document.createElement("div"));
    elsewhere.dispatchEvent(new Event("scroll"));
    overlay.element.dispatchEvent(new Event("scroll"));
    elsewhere.remove();
    const scrollsAfterOthers = scrolls;

    const scroller = DomFixture.one(DomFixture.host(fixture), ".scroller");
    scroller.scrollTop = 120;
    await DomChangeFixture.untilAsync(() => expect(scrolls).toBe(1));

    expect(scrollsAfterOthers).toBe(0);
    expect(overlay.isOpen).toBe(true);
  });

  it("reports an ancestor scroll that moves its anchor though a render resizes it before the scroll's event comes", async () => {
    let scrolls = 0;
    overlay.originLost.subscribe(() => scrolls++);
    overlay.openComponent(new ComponentPortal(ContentComponent), anchor(), below());
    const reposition = vi.spyOn(overlay, "reposition");
    DomFixture.one(DomFixture.host(fixture), ".scroller").scrollTop = 120;
    TestBed.inject(ApplicationRef).tick();
    const before = [reposition.mock.calls.length, scrolls];
    await DomChangeFixture.untilAsync(() => expect(scrolls).toBe(1));

    expect(before).toEqual([1, 0]);
    expect(overlay.isOpen).toBe(true);
  });

  it("follows its anchor when content around it moves it within the area it shows, and reports it lost once it moves out, but not for a move elsewhere or an event that carries no area", () => {
    let losses = 0;
    overlay.originLost.subscribe(() => losses++);
    const content = overlay.openComponent(new ComponentPortal(ContentComponent), anchor(), below());
    content.changeDetectorRef.detectChanges();
    overlay.reposition();
    const scroller = DomFixture.one(DomFixture.host(fixture), ".scroller");
    const shown = new DOMRectReadOnly(0, 0, 600, 400);
    const reposition = vi.spyOn(overlay, "reposition");
    const elsewhere = document.body.appendChild(document.createElement("div"));
    anchor().style.top = "250px";
    elsewhere.dispatchEvent(new ContentMovedEvent(shown, elsewhere));
    elsewhere.remove();
    scroller.dispatchEvent(new Event("nol-content-moved"));
    const afterElsewhere = [reposition.mock.calls.length, losses];
    scroller.dispatchEvent(new ContentMovedEvent(shown, scroller));
    const box = overlay.element.getBoundingClientRect();
    const target = anchor().getBoundingClientRect();
    const afterMove = losses;
    anchor().style.top = "390px";
    scroller.dispatchEvent(new ContentMovedEvent(new DOMRectReadOnly(0, 0, 600, 300), scroller));

    expect(afterElsewhere).toEqual([0, 0]);
    expect([box.left, box.top, afterMove]).toEqual([target.left, target.bottom + 8, 0]);
    expect([losses, reposition.mock.calls.length]).toEqual([1, 1]);
  });

  it("hands the focus it holds to the element that moved its anchor out of the shown area, and leaves the focus elsewhere alone", () => {
    const scroller = DomFixture.one(DomFixture.host(fixture), ".scroller");
    scroller.tabIndex = -1;
    overlay.openComponent(new ComponentPortal(ContentComponent), anchor(), below());
    overlay.element.tabIndex = -1;
    overlay.element.focus();
    anchor().style.top = "390px";
    scroller.dispatchEvent(new ContentMovedEvent(new DOMRectReadOnly(0, 0, 600, 300), scroller));
    const handed = document.activeElement;
    anchor().focus();
    scroller.dispatchEvent(new ContentMovedEvent(new DOMRectReadOnly(0, 0, 600, 300), scroller));

    expect(handed).toBe(scroller);
    expect(document.activeElement).toBe(anchor());
  });

  it("reports an anchor that stops rendering, but not one that only resizes", async () => {
    let losses = 0;
    const lost = new ChangeSignalFixture();
    overlay.originLost.subscribe(() => {
      losses++;
      lost.fire();
    });
    const origin = anchor();
    // The overlay's observer of its anchor asks whether the anchor still renders each time it sees it resize.
    const seen = new ChangeSignalFixture();
    let checks = 0;
    const isVisible = origin.checkVisibility.bind(origin);
    vi.spyOn(origin, "checkVisibility").mockImplementation(options => {
      checks++;
      seen.fire();
      return isVisible(options);
    });
    overlay.openComponent(new ComponentPortal(ContentComponent), origin, below());
    origin.style.width = "200px";
    await seen.untilAsync(() => expect(checks, "the overlay's checks of its resized anchor").toBeGreaterThan(0));
    const lossesAfterResize = losses;

    DomFixture.one(DomFixture.host(fixture), ".scroller").style.display = "none";
    await lost.untilAsync(() => expect(losses).toBe(1));

    expect(lossesAfterResize).toBe(0);
  });

  it("does nothing when asked to reposition while closed and lets go of its listeners once closed", () => {
    overlay.reposition();
    expect(overlay.placement).toBeNull();
    const added = vi.spyOn(window, "removeEventListener");
    overlay.openComponent(new ComponentPortal(ContentComponent), anchor(), below());

    overlay.close();

    expect(overlay.isOpen).toBe(false);
    expect(added).toHaveBeenCalledWith("resize", expect.any(Function));
  });

  it("passes on its keyboard and outside pointer events and its detachments", () => {
    const keys: string[] = [];
    const outside: MouseEvent[] = [];
    let detached = 0;
    overlay.keydownEvents.subscribe(t => keys.push(t.key));
    overlay.outsidePointerEvents.subscribe(t => outside.push(t));
    overlay.detachments.subscribe(() => detached++);
    overlay.openComponent(new ComponentPortal(ContentComponent), anchor(), below());

    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    overlay.close();

    expect(keys).toEqual(["Escape"]);
    expect(outside.length).toBe(1);
    expect(detached).toBe(1);
  });
});
