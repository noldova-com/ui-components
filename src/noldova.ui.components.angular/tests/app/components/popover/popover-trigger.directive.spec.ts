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
import { PopoverOpening } from "../../../../src/app/enums/popover-opening";
import { ClockTokens } from "../../../../src/app/models/clock-tokens";
import { OverlaySide } from "../../../../src/app/models/overlay-side";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { OverlayWrapperFixture } from "../../../fixtures/overlay-wrapper.fixture";
import { TestTimeSource } from "../../../fixtures/test-time-source";

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
    await DomChangeFixture.untilAsync(() => expect(surface()).not.toBeNull());
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
    await DomChangeFixture.untilAsync(() => expect(document.activeElement).toBe(popover));

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
    await DomChangeFixture.untilAsync(() => expect(document.activeElement).toBe(popover));

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
    await DomChangeFixture.untilAsync(() => expect(document.activeElement).toBe(popover));

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
    await DomChangeFixture.untilAsync(() => expect(document.activeElement).toBe(popover));

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
      await DomChangeFixture.untilAsync(() => expect(document.activeElement).toBe(popover));
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

    await DomChangeFixture.untilAsync(() => expect(trigger().getBoundingClientRect().top - popover.getBoundingClientRect().bottom).toBeCloseTo(gap, 1));
    expect(popover.getBoundingClientRect().right).toBeCloseTo(trigger().getBoundingClientRect().right, 1);
    fixture.destroy();

    await renderAsync(OverlaySide.below, OverlayAlignment.Start);
    const anchor = DomFixture.one(DomFixture.host(fixture), ".anchor");
    anchor.style.cssText = "position: fixed; left: 4rem; top: 0.25rem";
    anchor.setAttribute("data-nol-chrome", "top");
    const below = await openAsync();

    await DomChangeFixture.untilAsync(() => expect(below.getBoundingClientRect().top - trigger().getBoundingClientRect().bottom).toBeCloseTo(gap, 1));
    expect(below.getBoundingClientRect().left).toBeCloseTo(trigger().getBoundingClientRect().left, 1);
  });

  it("keeps a popover with a tall content inside the window and lets it scroll", async () => {
    await renderAsync();
    const popover = await openAsync();
    popover.append(Object.assign(document.createElement("div"), { style: "height: 200vh; flex: none" }));

    await DomChangeFixture.untilAsync(() => expect(popover.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight));

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

@Component({
  imports: [PopoverDirective, PopoverTriggerDirective],
  template: `
    <button type="button" class="before">Before</button>
    <div class="card" tabindex="0" style="position: fixed; right: 4rem; top: 16rem; width: 15rem; height: 4rem" [nolPopoverTrigger]="details" [nolPopoverOpenOn]="openOn">
      Alice
    </div>
    <button type="button" class="after">After</button>
    <ng-template #details>
      <div nolPopover label="Alice's details">
        <p>Developer</p>
        <button type="button" class="inside">Message</button>
      </div>
    </ng-template>
  `
})
class HoverPopoverHostComponent {
  public openOn: PopoverOpening = PopoverOpening.Hover;
}

describe("PopoverTriggerDirective on hover and focus", () => {
  let fixture: ComponentFixture<HoverPopoverHostComponent>;
  let source: TestTimeSource;

  async function renderAsync(openOn: PopoverOpening = PopoverOpening.Hover): Promise<void> {
    AppearanceFixture.apply();
    source = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: source }] });
    fixture = TestBed.createComponent(HoverPopoverHostComponent);
    fixture.componentInstance.openOn = openOn;
    await fixture.whenStable();
  }

  const card = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), ".card");
  const button = (name: string): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), `.${name}`, HTMLButtonElement);
  const surface = (): HTMLElement | null => document.querySelector(".cdk-overlay-container .nol-popover");
  const pane = (popover: HTMLElement): HTMLElement => DomFixture.closest(popover, ".nol-popover-pane");
  const pointer = (pointerType: string, relatedTarget: EventTarget | null = null, x: number = 1, y: number = 1): PointerEvent =>
    new PointerEvent("pointerleave", { pointerType, relatedTarget, clientX: x, clientY: y });

  async function settleAsync(): Promise<void> {
    source.advance(0);
    await fixture.whenStable();
  }

  async function shownAsync(): Promise<HTMLElement> {
    await fixture.whenStable();
    await DomChangeFixture.untilAsync(() => expect(surface()).not.toBeNull());
    return DomFixture.present(surface());
  }

  async function hoverAsync(): Promise<HTMLElement> {
    card().dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
    source.advance(500);
    return shownAsync();
  }

  async function focusByKeyboardAsync(): Promise<HTMLElement> {
    button("before").focus();
    await userEvent.tab();
    return shownAsync();
  }

  afterEach(() => {
    fixture.destroy();
    AppearanceFixture.reset();
  });

  it("opens once the pointer has rested the tooltip's delay on the trigger, leaving the focus where it is, and nothing for a pointer that leaves sooner", async () => {
    await renderAsync();
    button("before").focus();

    card().dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
    source.advance(499);
    card().dispatchEvent(pointer("mouse", document.body));
    source.advance(60_000);
    await fixture.whenStable();
    const early = surface();
    const popover = await hoverAsync();
    await fixture.whenStable();

    expect([early, card().getAttribute("aria-haspopup"), card().getAttribute("aria-expanded"), popover.getAttribute("role"), popover.getAttribute("aria-label")])
      .toEqual([null, "dialog", "true", "dialog", "Alice's details"]);
    expect(document.activeElement).toBe(button("before"));
  });

  it("stays open while the pointer moves from the trigger into the popover and back, and closes once it leaves both", async () => {
    await renderAsync();
    const popover = await hoverAsync();

    card().dispatchEvent(pointer("mouse", popover));
    await settleAsync();
    const afterInto = surface() !== null;
    pane(popover).dispatchEvent(pointer("mouse", card()));
    await settleAsync();
    const afterBack = surface() !== null;
    card().dispatchEvent(pointer("mouse", document.body));
    await settleAsync();

    expect([afterInto, afterBack, surface(), card().getAttribute("aria-expanded")]).toEqual([true, true, null, "false"]);
  });

  it("stays open while the pointer crosses the gap toward the popover, and closes when it strays from that path or leaves the popover", async () => {
    await renderAsync();
    const popover = await hoverAsync();
    const from = card().getBoundingClientRect();
    const box = pane(popover).getBoundingClientRect();
    const across = from.right - 8;

    card().dispatchEvent(pointer("mouse", document.body, across, from.top - 1));
    document.body.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: across, clientY: (from.top + box.bottom) / 2 }));
    await settleAsync();
    const inGap = surface() !== null;
    popover.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: across, clientY: box.bottom - 4 }));
    await settleAsync();
    const inside = surface() !== null;
    pane(popover).dispatchEvent(pointer("mouse", document.body, box.left - 40, box.top - 40));
    await settleAsync();
    const leftPopover = surface() === null;
    await hoverAsync();
    card().dispatchEvent(pointer("mouse", document.body, across, from.top - 1));
    document.body.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: 1, clientY: 1 }));
    await settleAsync();

    expect([inGap, inside, leftPopover, surface()]).toEqual([true, true, true, null]);
  });

  it("opens at once on keyboard focus and keeps the focus on the trigger, stays open as the pointer leaves or the focus moves into it and back, and closes when the focus leaves both", async () => {
    await renderAsync();

    const popover = await focusByKeyboardAsync();
    const opened = [document.activeElement === card(), card().getAttribute("aria-expanded")];
    card().dispatchEvent(pointer("mouse", document.body));
    await settleAsync();
    const afterPointer = surface() !== null;
    DomFixture.oneOf(popover, ".inside", HTMLButtonElement).focus();
    await settleAsync();
    const afterInside = surface() !== null;
    card().focus();
    await settleAsync();
    const afterBack = surface() !== null;
    await userEvent.tab();
    await settleAsync();

    expect([opened, afterPointer, afterInside, afterBack, surface()]).toEqual([[true, "true"], true, true, true, null]);
    expect(document.activeElement).toBe(button("after"));
  });

  it("keeps a hovered popover open once the keyboard focuses its trigger, until the focus leaves, and closes on a pointer leaving for no element", async () => {
    await renderAsync();

    await hoverAsync();
    button("before").focus();
    await userEvent.tab();
    await fixture.whenStable();
    card().dispatchEvent(pointer("mouse", document.body));
    await settleAsync();
    const heldByFocus = surface() !== null;
    await userEvent.tab();
    await settleAsync();
    const afterTab = surface();
    await hoverAsync();
    card().dispatchEvent(pointer("mouse", null));
    await settleAsync();

    expect([heldByFocus, afterTab, surface()]).toEqual([true, null, null]);
  });

  it("closes on Escape, leaving the focus on the trigger, or bringing it back to the trigger from inside the popover, and when the focus leaves for nowhere", async () => {
    await renderAsync();

    await focusByKeyboardAsync();
    await userEvent.keyboard("{Escape}");
    await fixture.whenStable();
    const fromTrigger = [surface(), document.activeElement === card()];
    button("before").focus();
    const popover = await hoverAsync();
    DomFixture.oneOf(popover, ".inside", HTMLButtonElement).focus();
    await userEvent.keyboard("{Escape}");
    await fixture.whenStable();
    const fromInside = [surface(), document.activeElement === card()];
    await focusByKeyboardAsync();
    card().blur();
    await settleAsync();

    expect([fromTrigger, fromInside, surface()]).toEqual([[null, true], [null, true], null]);
  });

  it("opens and closes on a tap, moving the focus in as a click does, and ignores a touch's hover and a mouse click", async () => {
    await renderAsync();

    card().dispatchEvent(new PointerEvent("pointerenter", { pointerType: "touch" }));
    source.advance(500);
    await fixture.whenStable();
    const afterTouchHover = surface();
    card().dispatchEvent(new PointerEvent("pointerdown", { pointerType: "mouse", bubbles: true }));
    card().click();
    await fixture.whenStable();
    const afterMouseClick = surface();
    card().dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", bubbles: true }));
    card().click();
    const popover = await shownAsync();
    await DomChangeFixture.untilAsync(() => expect(document.activeElement).toBe(popover));
    pane(popover).dispatchEvent(pointer("touch", document.body));
    card().dispatchEvent(pointer("touch", document.body));
    await settleAsync();
    const afterTouchLeave = surface() !== null;
    card().dispatchEvent(new PointerEvent("pointerdown", { pointerType: "touch", bubbles: true }));
    card().click();
    await fixture.whenStable();

    expect([afterTouchHover, afterMouseClick, afterTouchLeave, surface()]).toEqual([null, null, true, null]);
    expect(document.activeElement).toBe(card());
  });

  it("opens only on a click when it opens on a click, whatever the pointer or the focus does", async () => {
    await renderAsync(PopoverOpening.Click);

    card().dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
    source.advance(500);
    button("before").focus();
    await userEvent.tab();
    await fixture.whenStable();
    const shown = surface();
    card().click();
    const popover = await shownAsync();
    pane(popover).dispatchEvent(pointer("mouse", document.body));
    card().dispatchEvent(pointer("mouse", document.body));
    await settleAsync();

    expect([shown, surface() !== null]).toEqual([null, true]);
  });

  it("places a hovered popover above the trigger, a gap away, end-aligned and in its preferred width", async () => {
    await renderAsync();
    const popover = await hoverAsync();
    const rem = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);

    await DomChangeFixture.untilAsync(() => {
      source.runFrames();
      expect(card().getBoundingClientRect().top - popover.getBoundingClientRect().bottom).toBeCloseTo(rem * 0.5, 1);
    });
    AppearanceFixture.expectPixels(popover.getBoundingClientRect().right, card().getBoundingClientRect().right);
    AppearanceFixture.expectPixels(popover.getBoundingClientRect().width, rem * 27.5);
  });
});
