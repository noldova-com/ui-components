/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, type Signal, viewChild } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { PopoverDirective } from "../../../../src/app/components/popover/popover.directive";
import { PopoverTriggerDirective } from "../../../../src/app/components/popover/popover-trigger.directive";
import { OverlayAlignment } from "../../../../src/app/enums/overlay-alignment";
import { OverlaySide } from "../../../../src/app/models/overlay-side";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { OverlayWrapperFixture } from "../../../fixtures/overlay-wrapper.fixture";

@Component({
  imports: [PopoverDirective, PopoverTriggerDirective],
  template: `
    <button type="button" class="before">Before</button>
    <div class="anchor" data-nol-chrome="bottom" style="position: fixed; right: 4rem; bottom: 0.25rem">
      <button type="button" class="trigger" [nolPopoverTrigger]="popover" [nolPopoverSide]="side" [nolPopoverAlignment]="alignment" (opened)="opens = opens + 1">Open</button>
    </div>
    <ng-template #popover>
      <div nolPopover label="Details">
        <h2 class="title">Details</h2>
        <button type="button" class="inside">Inside</button>
      </div>
    </ng-template>
  `
})
class PopoverHostComponent {
  public readonly trigger: Signal<PopoverTriggerDirective | undefined> = viewChild(PopoverTriggerDirective);
  public side: OverlaySide = OverlaySide.above;
  public alignment: OverlayAlignment = OverlayAlignment.End;
  public opens: number = 0;
}

describe("PopoverTriggerDirective", () => {
  let fixture: ComponentFixture<PopoverHostComponent>;

  async function renderAsync(side: OverlaySide = OverlaySide.above, alignment: OverlayAlignment = OverlayAlignment.End): Promise<void> {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(PopoverHostComponent);
    fixture.componentInstance.side = side;
    fixture.componentInstance.alignment = alignment;
    await fixture.whenStable();
  }

  const trigger = (): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), ".trigger", HTMLButtonElement);
  const surface = (): HTMLElement | null => document.querySelector(".cdk-overlay-container .nol-popover");

  async function openAsync(): Promise<HTMLElement> {
    trigger().click();
    await fixture.whenStable();
    await vi.waitFor(() => expect(surface()).not.toBeNull());
    return surface() as HTMLElement;
  }

  async function pressAsync(target: Element): Promise<void> {
    target.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await fixture.whenStable();
  }

  afterEach(async () => {
    await userEvent.keyboard("{Escape}");
    AppearanceFixture.reset();
  });

  it("offers its popover as a dialog it has not opened yet", async () => {
    await renderAsync();

    expect([trigger().getAttribute("aria-haspopup"), trigger().getAttribute("aria-expanded"), surface()]).toEqual(["dialog", "false", null]);
  });

  it("opens a named dialog on click, reports it expanded, says it opened and moves focus into it", async () => {
    await renderAsync();

    const popover = await openAsync();
    await vi.waitFor(() => expect(document.activeElement).toBe(popover));

    expect([popover.getAttribute("role"), popover.getAttribute("aria-label"), popover.tabIndex]).toEqual(["dialog", "Details", -1]);
    expect([trigger().getAttribute("aria-expanded"), fixture.componentInstance.opens, fixture.componentInstance.trigger()?.isOpen()]).toEqual(["true", 1, true]);
  });

  it("closes on a click on the trigger again and on a click outside, but not on a click inside", async () => {
    await renderAsync();
    const outside = document.body.appendChild(document.createElement("div"));
    const popover = await openAsync();

    await pressAsync(DomFixture.oneOf(popover, ".inside", Element));
    const isOpenAfterInside = surface() !== null;
    await pressAsync(outside);
    const isClosedByOutside = surface() === null;
    await openAsync();
    await pressAsync(trigger());
    outside.remove();

    expect([isOpenAfterInside, isClosedByOutside, surface(), trigger().getAttribute("aria-expanded")]).toEqual([true, true, null, "false"]);
  });

  it("leaves focus alone when it closes before its first render", async () => {
    await renderAsync();
    trigger().focus();

    trigger().click();
    trigger().click();
    await fixture.whenStable();

    expect([surface(), document.activeElement, fixture.componentInstance.opens]).toEqual([null, trigger(), 1]);
  });

  it("closes on Escape and returns focus to the trigger, but not on other keys", async () => {
    await renderAsync();
    const popover = await openAsync();
    await vi.waitFor(() => expect(document.activeElement).toBe(popover));

    popover.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    await fixture.whenStable();
    const isOpenAfterTab = surface() !== null;
    popover.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await fixture.whenStable();

    expect([isOpenAfterTab, surface(), document.activeElement]).toEqual([true, null, trigger()]);
  });

  it("keeps an Escape that something inside it already handled, and returns focus to the trigger when it is closed from inside", async () => {
    await renderAsync();
    const popover = await openAsync();
    await vi.waitFor(() => expect(document.activeElement).toBe(popover));

    const handled = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    handled.preventDefault();
    DomFixture.one(popover, ".inside").dispatchEvent(handled);
    await fixture.whenStable();
    const isOpenAfterHandled = surface() !== null;
    fixture.componentInstance.trigger()?.close();

    expect([isOpenAfterHandled, surface(), document.activeElement]).toEqual([true, null, trigger()]);
  });

  it("moves the focus to its control by Tab, and closes on a Tab past its last control, returning focus to the trigger", async () => {
    await renderAsync();
    const popover = await openAsync();
    await vi.waitFor(() => expect(document.activeElement).toBe(popover));

    await userEvent.keyboard("{Tab}");
    const first = [surface() !== null, document.activeElement === popover.querySelector(".inside")];
    await userEvent.keyboard("{Tab}");
    await fixture.whenStable();

    expect([first, surface(), document.activeElement]).toEqual([[true, true], null, trigger()]);
  });

  for (const from of ["the popover", "its first control"])
    it(`closes on a Shift+Tab from ${from}, before its first control, returning focus to the trigger`, async () => {
      await renderAsync();
      const popover = await openAsync();
      await vi.waitFor(() => expect(document.activeElement).toBe(popover));
      if (from === "its first control")
        await userEvent.keyboard("{Tab}");
      const before = [surface() !== null, document.activeElement === popover.querySelector(".inside")];

      await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
      await fixture.whenStable();

      expect([before, surface(), document.activeElement]).toEqual([[true, from === "its first control"], null, trigger()]);
    });

  it("stays open on a Tab that a control inside already handled, on a key other than Tab or Escape, and on a Tab while the focus is outside it", async () => {
    await renderAsync();
    const popover = await openAsync();
    const inside = popover.querySelector<HTMLElement>(".inside");
    inside?.focus();
    const isInside = document.activeElement === inside;

    const handled = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    handled.preventDefault();
    inside?.dispatchEvent(handled);
    inside?.dispatchEvent(new KeyboardEvent("keydown", { key: "a", bubbles: true }));
    await fixture.whenStable();
    const isOpenInside = surface() !== null;
    trigger().focus();
    trigger().dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
    await fixture.whenStable();

    expect([isInside, isOpenInside, surface() !== null]).toEqual([true, true, true]);
  });

  it("closes when something around the trigger scrolls", async () => {
    await renderAsync();
    await openAsync();

    DomFixture.one(DomFixture.host(fixture), ".anchor").style.bottom = "3rem";
    DomFixture.host(fixture).dispatchEvent(new Event("scroll"));
    await fixture.whenStable();

    expect(surface()).toBeNull();
  });

  it("closes through its close method, and again harmlessly, and when its trigger is destroyed", async () => {
    await renderAsync();
    await openAsync();
    const directive = fixture.componentInstance.trigger();

    directive?.close();
    directive?.close();
    const isClosed = surface() === null;
    await openAsync();
    fixture.destroy();

    expect([isClosed, surface(), directive?.isOpen()]).toEqual([true, null, false]);
  });

  it("places its popover above the trigger, a gap away and end-aligned, and below it on the other side", async () => {
    await renderAsync();
    const popover = await openAsync();
    const gap = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * 0.5;

    await vi.waitFor(() => expect(trigger().getBoundingClientRect().top - popover.getBoundingClientRect().bottom).toBeCloseTo(gap, 1));
    expect(popover.getBoundingClientRect().right).toBeCloseTo(trigger().getBoundingClientRect().right, 1);
    fixture.destroy();

    await renderAsync(OverlaySide.below, OverlayAlignment.Start);
    const anchor = DomFixture.one(DomFixture.host(fixture), ".anchor");
    anchor.style.cssText = "position: fixed; left: 4rem; top: 0.25rem";
    anchor.setAttribute("data-nol-chrome", "top");
    const below = await openAsync();

    await vi.waitFor(() => expect(below.getBoundingClientRect().top - trigger().getBoundingClientRect().bottom).toBeCloseTo(gap, 1));
    expect(below.getBoundingClientRect().left).toBeCloseTo(trigger().getBoundingClientRect().left, 1);
  });

  it("keeps a popover with a tall content inside the window and lets it scroll", async () => {
    await renderAsync();
    const popover = await openAsync();
    popover.append(Object.assign(document.createElement("div"), { style: "height: 200vh; flex: none" }));

    await vi.waitFor(() => expect(popover.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight));

    expect([popover.getBoundingClientRect().top >= 0, getComputedStyle(popover).overflowY, popover.scrollHeight > popover.clientHeight]).toEqual([true, "auto", true]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its surface and geometry from the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync();
        AppearanceFixture.apply(theme, mode);
        const style = getComputedStyle(await openAsync());

        expect(style.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "menu"));
        expect(style.borderTopColor).toBe(AppearanceFixture.readColor(theme, mode, "menu-border"));
        expect(style.boxShadow).not.toBe("none");
        AppearanceFixture.expectLook(style.width, theme, "popover-width", "width");
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-large", "border-top-left-radius");
        AppearanceFixture.expectLook(style.paddingTop, theme, "space-3", "padding-top");
        AppearanceFixture.expectLook(style.rowGap, theme, "space-2", "row-gap");
        expect(getComputedStyle(DomFixture.oneOf(DomFixture.present(surface()), ".title", Element)).color).toBe(AppearanceFixture.readColor(theme, mode, "menu-text"));
      });

  it("keeps a popover too large for the window within its overlay wrapper less the margins, not the viewport, as it must beside classic scrollbars", async () => {
    OverlayWrapperFixture.showScrollbars();
    await renderAsync();
    const popover = await openAsync();
    popover.style.setProperty("--nol-popover-width", "500vw");
    popover.style.height = "500vh";
    const box = OverlayWrapperFixture.narrow(popover.closest(".nol-popover-pane") as Element);

    await OverlayWrapperFixture.expectCappedAsync(popover, box);
    AppearanceFixture.expectPixels(popover.getBoundingClientRect().height, box.height - AppearanceFixture.measureLook("space-6") * 2);
  });
});
