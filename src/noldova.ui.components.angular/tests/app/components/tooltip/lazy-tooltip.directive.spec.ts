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
import { OverlaySide } from "../../../../src/app/models/overlay-side";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { ChangeSignalFixture } from "../../../fixtures/change-signal.fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { LayoutSettleFixture } from "../../../fixtures/layout-settle.fixture";

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

describe("LazyTooltipDirective", () => {
  const statics = LazyTooltipDirective as unknown as { module: Promise<unknown> | null; loadAsync: () => Promise<unknown> };
  let fixture: ComponentFixture<LazyTooltipHostComponent>;

  beforeEach(() => TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] }));

  beforeEach(() => AppearanceFixture.apply());

  // The engine's import, held or failed, goes back to the real one, so no later spec meets a stand-in.
  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
    vi.restoreAllMocks();
    statics.module = null;
  });

  async function renderAsync(): Promise<void> {
    fixture = TestBed.createComponent(LazyTooltipHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  // Holds the engine's import until the spec lets it arrive with the real module.
  function holdEngine(): () => Promise<void> {
    let finish: (module: unknown) => void = () => undefined;
    vi.spyOn(statics, "loadAsync").mockReturnValue(new Promise(resolve => finish = resolve));
    return async () => finish(await import("../../../../src/app/components/tooltip/tooltip-engine"));
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
    const arrive = holdEngine();
    await renderAsync();
    await userEvent.hover(anchor());

    expect(tooltip()).toBeNull();
    await arrive();

    expect((await shownAsync()).textContent?.trim()).toBe("Split the group to the right");
  });

  it("shows the tooltip for a keyboard focus on its anchor that came before the engine arrived", async () => {
    const arrive = holdEngine();
    await renderAsync();
    DomFixture.one(DomFixture.host(fixture), ".before").focus();
    await userEvent.keyboard("{Tab}");

    expect(document.activeElement).toBe(anchor());
    await arrive();

    expect((await shownAsync()).textContent?.trim()).toBe("Split the group to the right");
  });

  it("builds no engine for an anchor gone before the engine arrived", async () => {
    const arrive = holdEngine();
    const describe = vi.spyOn(AriaDescriber.prototype, "describe");
    await renderAsync();
    const gone = anchor();
    fixture.destroy();
    await arrive();
    await statics.loadAsync();

    expect([describe.mock.calls.length, gone.getAttribute("aria-describedby"), tooltip()]).toEqual([0, null, null]);
  });

  it("reports an engine that can't load to the error handler and leaves its anchor without a tooltip", async () => {
    statics.module = null;
    const failure = new Error("The tooltip engine's chunk did not load.");
    vi.spyOn(statics, "loadAsync").mockRejectedValue(failure);
    const reported = new ChangeSignalFixture();
    const report = vi.spyOn(TestBed.inject(ErrorHandler), "handleError").mockImplementation(() => reported.fire());
    await renderAsync();
    await reported.untilAsync(() => expect(report).toHaveBeenCalledWith(failure));
    await userEvent.hover(anchor());
    await fixture.whenStable();

    expect([report.mock.calls, anchor().getAttribute("aria-describedby"), tooltip()]).toEqual([[[failure]], null, null]);
  });
});
