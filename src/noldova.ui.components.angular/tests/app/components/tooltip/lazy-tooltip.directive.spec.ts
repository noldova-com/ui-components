/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AriaDescriber } from "@angular/cdk/a11y";
import { Component, ErrorHandler, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { LazyTooltipDirective } from "../../../../src/app/components/tooltip/lazy-tooltip.directive";
import { TooltipEngineLoader } from "../../../../src/app/components/tooltip/tooltip-engine-loader";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { OverlaySide } from "../../../../src/app/models/overlay-side";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { ChangeSignalFixture } from "../../../fixtures/change-signal.fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { LayoutSettleFixture } from "../../../fixtures/layout-settle.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

@Component({
  imports: [LazyTooltipDirective],
  template: `
    <button type="button" class="before">Before</button>
    <div style="position: fixed; top: 300px; left: 400px; padding: 20px;">
      <button type="button" class="anchor" aria-label="Split" [nolTooltip]="text()" [nolTooltipSide]="side()">Split</button>
    </div>
    <button type="button" class="other">Other</button>
  `
})
class LazyTooltipHostComponent {
  public readonly text = signal("Split the group to the right");
  public readonly side = signal(OverlaySide.above);
}

// Holds the engine's import until the spec lets it arrive with the real module.
class HeldEngineLoader extends TooltipEngineLoader {
  private finish: () => void = () => undefined;
  private loaded: ReturnType<TooltipEngineLoader["loadAsync"]> | null = null;

  public override loadAsync(): ReturnType<TooltipEngineLoader["loadAsync"]> {
    this.loaded = new Promise<void>(resolve => this.finish = resolve).then(() => super.loadAsync());
    return this.loaded;
  }

  // Lets the import arrive, and returns once every anchor waiting on it has met it.
  public async arriveAsync(): Promise<void> {
    this.finish();
    await this.loaded;
  }
}

// An engine import that fails.
class FailedEngineLoader extends TooltipEngineLoader {
  private readonly failure: Error;

  public constructor(failure: Error) {
    super();
    this.failure = failure;
  }

  public override loadAsync(): ReturnType<TooltipEngineLoader["loadAsync"]> {
    return Promise.reject(this.failure);
  }
}

describe("LazyTooltipDirective", () => {
  let fixture: ComponentFixture<LazyTooltipHostComponent>;

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  beforeEach(() => AppearanceFixture.apply());

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
    vi.restoreAllMocks();
  });

  async function renderAsync(): Promise<void> {
    fixture = TestBed.createComponent(LazyTooltipHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function holdEngine(): HeldEngineLoader {
    const loader = new HeldEngineLoader();
    TestBed.overrideProvider(TooltipEngineLoader, { useValue: loader });
    return loader;
  }

  // A clock the spec moves itself, so it sees whether a show waits on it.
  function stillClock(): TestTimeSource {
    const clock = new TestTimeSource();
    TestBed.overrideProvider(ClockTokens.timeSource, { useValue: clock });
    return clock;
  }

  function anchor(): HTMLElement {
    return DomFixture.one(DomFixture.host(fixture), ".anchor");
  }

  function tooltip(): HTMLElement | null {
    return document.querySelector<HTMLElement>(".cdk-overlay-container nol-tooltip");
  }

  async function shownAsync(): Promise<HTMLElement> {
    await DomChangeFixture.untilAsync(() => expect(tooltip()).not.toBeNull());
    await fixture.whenStable();
    await LayoutSettleFixture.settledAsync("the tooltip's place", () => JSON.stringify(tooltip()?.getBoundingClientRect() ?? null),
      () => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
    return tooltip() ?? anchor();
  }

  it("imports the tooltip's engine once its anchor renders, then describes the anchor and shows its text above it on hover, a gap away, as the tooltip does", async () => {
    await renderAsync();
    await DomChangeFixture.untilAsync(() => expect(anchor().getAttribute("aria-describedby")).not.toBeNull());
    await userEvent.hover(anchor());
    const shown = await shownAsync();
    const box = shown.getBoundingClientRect();
    const target = anchor().getBoundingClientRect();
    const gap = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.5;

    expect([shown.textContent?.trim(), shown.getAttribute("role")]).toEqual(["Split the group to the right", "tooltip"]);
    expect(target.top - box.bottom).toBeCloseTo(gap, 0);
    expect(box.left + box.width / 2).toBeCloseTo(target.left + target.width / 2, 0);
    expect(document.getElementById(anchor().getAttribute("aria-describedby") ?? "")?.textContent).toBe("Split the group to the right");
  });

  it("shows the tooltip for a pointer that came onto its anchor before the engine arrived", async () => {
    const held = holdEngine();
    await renderAsync();
    await userEvent.hover(anchor());

    expect(tooltip()).toBeNull();
    await held.arriveAsync();

    expect((await shownAsync()).textContent?.trim()).toBe("Split the group to the right");
  });

  it("shows the tooltip for a keyboard focus on its anchor that came before the engine arrived", async () => {
    const held = holdEngine();
    await renderAsync();
    DomFixture.one(DomFixture.host(fixture), ".before").focus();
    await userEvent.keyboard("{Tab}");

    expect(document.activeElement).toBe(anchor());
    await held.arriveAsync();

    expect((await shownAsync()).textContent?.trim()).toBe("Split the group to the right");
  });

  it("builds no engine for an anchor gone before the engine arrived", async () => {
    const held = holdEngine();
    const describe = vi.spyOn(AriaDescriber.prototype, "describe");
    await renderAsync();
    const gone = anchor();
    fixture.destroy();
    await held.arriveAsync();

    expect([describe.mock.calls.length, gone.getAttribute("aria-describedby"), tooltip()]).toEqual([0, null, null]);
  });

  it("hides on a press of its anchor, and on Escape while its anchor has the keyboard's focus, keeping that focus, as the tooltip does", async () => {
    await renderAsync();
    await DomChangeFixture.untilAsync(() => expect(anchor().getAttribute("aria-describedby")).not.toBeNull());
    await userEvent.hover(anchor());
    await shownAsync();
    anchor().dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    const pressed = tooltip();
    DomFixture.one(DomFixture.host(fixture), ".before").focus();
    await userEvent.keyboard("{Tab}");
    await shownAsync();
    await userEvent.keyboard("{Escape}");

    expect([pressed, tooltip(), document.activeElement]).toEqual([null, null, anchor()]);
  });

  it("shows nothing for a pointer that pressed its anchor before the engine arrived, until the pointer comes on again", async () => {
    const clock = stillClock();
    const held = holdEngine();
    await renderAsync();
    await userEvent.hover(anchor());
    anchor().dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    await held.arriveAsync();
    const pressed = [clock.timerCount, tooltip()];
    await userEvent.hover(DomFixture.one(DomFixture.host(fixture), ".other"));
    await userEvent.hover(anchor());

    expect([pressed, clock.timerCount]).toEqual([[0, null], 1]);
  });

  it("shows nothing for a keyboard focus that pressed Escape before the engine arrived, until the focus comes again", async () => {
    const held = holdEngine();
    await renderAsync();
    DomFixture.one(DomFixture.host(fixture), ".before").focus();
    await userEvent.keyboard("{Tab}");
    await userEvent.keyboard("{Escape}");
    await held.arriveAsync();
    const dismissed = tooltip();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await userEvent.keyboard("{Tab}");

    expect([dismissed, (await shownAsync()).textContent?.trim()]).toEqual([null, "Split the group to the right"]);
  });

  it("reports an engine that can't load to the error handler and leaves its anchor without a tooltip", async () => {
    const failure = new Error("The tooltip engine's chunk did not load.");
    TestBed.overrideProvider(TooltipEngineLoader, { useValue: new FailedEngineLoader(failure) });
    const reported = new ChangeSignalFixture();
    const report = vi.spyOn(TestBed.inject(ErrorHandler), "handleError").mockImplementation(() => reported.fire());
    await renderAsync();
    await reported.untilAsync(() => expect(report).toHaveBeenCalledWith(failure));
    await userEvent.hover(anchor());
    await fixture.whenStable();

    expect([report.mock.calls, anchor().getAttribute("aria-describedby"), tooltip()]).toEqual([[[failure]], null, null]);
  });
});
