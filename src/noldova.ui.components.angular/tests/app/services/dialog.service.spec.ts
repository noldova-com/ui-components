/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DialogRef } from "@angular/cdk/dialog";
import { ApplicationRef, Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { ClockTokens } from "../../../src/app/models/clock-tokens";
import { DefaultTheme } from "../../../src/app/models/default-theme";
import { DialogService } from "../../../src/app/services/dialog.service";
import { AppearanceFixture } from "../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../fixtures/dom.fixture";
import { MotionFixture } from "../../fixtures/motion.fixture";
import { TestTimeSource } from "../../fixtures/test-time-source";

@Component({
  template: `<button type="button" class="inside">Keep working</button><button type="button" class="other">Look elsewhere</button>`
})
class OpenDialogComponent {
}

describe("DialogService", () => {
  let opener: HTMLButtonElement;
  let live: HTMLElement;
  let inert: HTMLElement;
  let popover: HTMLElement;
  let references: DialogRef<unknown, OpenDialogComponent>[];
  let time: TestTimeSource;

  beforeEach(() => {
    references = [];
    opener = document.createElement("button");
    live = document.createElement("div");
    live.setAttribute("aria-live", "polite");
    inert = document.createElement("div");
    inert.inert = true;
    popover = document.createElement("div");
    popover.popover = "manual";
    document.body.append(opener, live, inert, popover);
    opener.focus();
  });

  afterEach(async () => {
    for (const reference of references.reverse())
      reference.close();
    await vi.waitFor(() => expect(document.querySelector(".inside")).toBeNull());
    for (const element of [opener, live, inert, popover])
      element.remove();
  });

  async function openAsync(): Promise<DialogRef<unknown, OpenDialogComponent>> {
    const reference = TestBed.inject(DialogService).open(OpenDialogComponent, ".inside");
    references.push(reference);
    await vi.waitFor(() => expect(document.activeElement).toBe(insideOf(references.length - 1)));
    return reference;
  }

  async function openShownAsync(): Promise<[DialogRef<unknown, OpenDialogComponent>, HTMLElement]> {
    const reference = await openAsync();
    const backdrop = reference.overlayRef.backdropElement as HTMLElement;
    await showingAsync(backdrop);
    backdrop.getAnimations().forEach(t => t.finish());
    return [reference, backdrop];
  }

  async function showingAsync(backdrop: HTMLElement): Promise<void> {
    await new Promise(resolve => requestAnimationFrame(resolve));
    expect(backdrop.classList.contains("cdk-overlay-backdrop-showing")).toBe(true);
  }

  function useTestTime(): void {
    time = new TestTimeSource();
    TestBed.configureTestingModule({ providers: [{ provide: ClockTokens.timeSource, useValue: time }] });
  }

  const settleAsync = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
  const framesAsync = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

  function insideOf(index: number, name: string = "inside"): HTMLElement {
    return document.querySelectorAll<HTMLElement>(`.${name}`)[index] as HTMLElement;
  }

  it("makes the window behind the first dialog inert and hidden from assistive technology until the last one closes, leaving live regions, popovers and the dialogs alone", async () => {
    await openAsync();
    const whileOne = [opener.inert, opener.getAttribute("aria-hidden"), live.inert, popover.inert, inert.inert, DomFixture.one(document, ".cdk-overlay-container").inert];
    const second = await openAsync();
    second.close();
    const afterSecond = opener.inert;
    references[0]?.close();
    references = [];

    expect(whileOne).toEqual([true, "true", false, false, true, false]);
    expect(afterSecond).toBe(true);
    expect([opener.inert, opener.hasAttribute("aria-hidden"), inert.inert]).toEqual([false, false, true]);
  });

  it("returns the focus to the control focused before a dialog opened once the window behind it is live again", async () => {
    const first = await openAsync();
    const inside = insideOf(0);
    const second = await openAsync();
    second.close();
    const afterSecond = document.activeElement;
    first.close();
    references = [];

    expect(afterSecond).toBe(inside);
    expect(document.activeElement).toBe(opener);
  });

  it("focuses no control in a dialog when none matches its first focus, leaving the focus on the dialog itself", async () => {
    references.push(TestBed.inject(DialogService).open(OpenDialogComponent, ".missing"));
    await vi.waitFor(() => expect(document.activeElement?.getAttribute("role")).toBe("dialog"));
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect([document.activeElement?.getAttribute("role"), document.querySelectorAll(".inside:focus, .other:focus").length]).toEqual(["dialog", 0]);
  });

  it("gives no first focus to a dialog closed before its first render, and leaves the focus on its opener", () => {
    TestBed.inject(DialogService).open(OpenDialogComponent, ".inside").close();

    expect(() => TestBed.inject(ApplicationRef).tick()).not.toThrow();
    expect(document.activeElement).toBe(opener);
  });

  it("leaves the focus where it is when it has already moved on as a dialog closes", async () => {
    await openAsync();
    const second = await openAsync();
    insideOf(0, "other").focus();
    second.close();

    expect(document.activeElement).toBe(insideOf(0, "other"));
  });

  it("leaves the focus on the control inside the dialog when the backdrop behind it is clicked", async () => {
    const reference = await openAsync();
    const other = insideOf(0, "other");
    other.focus();

    await userEvent.click(reference.overlayRef.backdropElement as HTMLElement, { position: { x: 1, y: 1 } });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(document.activeElement).toBe(other);
  });

  it("fades a closed dialog's backdrop out with the overlay's own transition, taking no pointer, while the focus, closed and the window behind come back at once, and then takes it away", async () => {
    const [reference, backdrop] = await openShownAsync();
    let closed = false;
    reference.closed.subscribe(() => closed = true);
    references = [];

    reference.close();
    const fades = backdrop.getAnimations();
    const fade = fades.find(t => t instanceof CSSTransition && t.transitionProperty === "opacity");
    fade?.pause();
    if (fade !== undefined)
      fade.currentTime = 200;
    const fading = [backdrop.isConnected, backdrop.parentElement?.matches(".cdk-overlay-popover:popover-open"), fades.length, getComputedStyle(backdrop).pointerEvents,
      closed, document.activeElement === opener, opener.inert, document.querySelectorAll("[role='dialog']").length];
    const halfway = parseFloat(getComputedStyle(backdrop).opacity);
    const host = backdrop.parentElement;
    fade?.finish();
    await settleAsync();

    expect(fading).toEqual([true, true, 1, "none", true, true, false, 0]);
    expect(halfway).toBeCloseTo(0.065, 2);
    expect([backdrop.isConnected, host?.isConnected, document.querySelectorAll(".cdk-overlay-backdrop").length]).toEqual([false, false, 0]);
  });

  it("fades a dialog closed while its backdrop still fades in out from the opacity it got to, rather than from full", async () => {
    const reference = await openAsync();
    const backdrop = reference.overlayRef.backdropElement as HTMLElement;
    await showingAsync(backdrop);
    const fadeIn = backdrop.getAnimations()[0];
    fadeIn?.pause();
    if (fadeIn !== undefined)
      fadeIn.currentTime = 100;
    const got = parseFloat(getComputedStyle(backdrop).opacity);
    references = [];

    reference.close();
    const fades = backdrop.getAnimations();
    fades.forEach(t => t.pause());
    const start = parseFloat(getComputedStyle(backdrop).opacity);
    fades.forEach(t => t.finish());
    await settleAsync();

    expect([got, fades.length, backdrop.style.opacity, backdrop.isConnected]).toEqual([expect.closeTo(0.708, 2), 1, "", false]);
    expect(start).toBeCloseTo(got, 2);
  });

  it("takes a closed dialog's backdrop away when its fade reaches its end", async () => {
    const [reference, backdrop] = await openShownAsync();
    references = [];

    reference.close();
    const fade = backdrop.getAnimations()[0];
    const connected = backdrop.isConnected;
    if (fade !== undefined)
      fade.currentTime = fade.effect?.getComputedTiming().endTime ?? 0;
    const ended = fade?.playState;
    await settleAsync();

    expect([ended, connected, backdrop.isConnected, document.querySelectorAll(".cdk-overlay-container > .cdk-overlay-popover").length]).toEqual(["finished", true, false, 0]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`lets a listener on the document hear a closed dialog's backdrop end its fade, once the backdrop has left the window behind it, in ${mode} mode`, async () => {
      AppearanceFixture.apply(DefaultTheme.theme, mode);
      const heard: (readonly [string, boolean])[] = [];
      const [reference, backdrop] = await openShownAsync();
      const listen = (event: TransitionEvent): void => {
        if (event.target === backdrop)
          heard.push([event.propertyName, backdrop.isConnected]);
      };
      document.addEventListener("transitionend", listen);
      try {
        references = [];

        reference.close();
        const shade = getComputedStyle(backdrop).backgroundColor;
        backdrop.getAnimations().forEach(t => t.finish());
        await settleAsync();

        expect(shade).not.toBe("rgba(0, 0, 0, 0)");
        expect([heard, backdrop.isConnected, document.elementFromPoint(1, 1)?.closest(".cdk-overlay-container") ?? null]).toEqual([[["opacity", false]], false, null]);
      }
      finally {
        document.removeEventListener("transitionend", listen);
        AppearanceFixture.reset();
      }
    });

  it("takes a closed dialog's backdrop away when its fade-out is cancelled, before the overlay's limit, and lets a listener on the document hear the cancel", async () => {
    useTestTime();
    const [reference, backdrop] = await openShownAsync();
    references = [];
    await settleAsync();
    const heard: (readonly [string, string, boolean])[] = [];
    const listen = (event: TransitionEvent): void => {
      if (event.target === backdrop)
        heard.push([event.type, event.propertyName, backdrop.isConnected]);
    };
    const types = ["transitionend", "transitioncancel"] as const;
    for (const type of types)
      document.addEventListener(type, listen);
    try {
      reference.close();
      backdrop.getAnimations().forEach(t => t.cancel());
      await framesAsync();

      expect([heard, backdrop.isConnected, document.querySelectorAll(".cdk-overlay-container > .cdk-overlay-popover").length, time.timerCount])
        .toEqual([[["transitioncancel", "opacity", false]], false, 0, 0]);
    }
    finally {
      for (const type of types)
        document.removeEventListener(type, listen);
    }
  });

  it("leaves a dialog opened during another's fade-out and its backdrop in place when the old fade ends after the new backdrop has faded in", async () => {
    useTestTime();
    const [first, fading] = await openShownAsync();
    references = [];
    first.close();
    const fades = fading.getAnimations();
    fades.forEach(t => t.pause());
    const [, shown] = await openShownAsync();
    await framesAsync();
    const before = [fading.isConnected, shown.isConnected];
    fades.forEach(t => t.finish());
    await framesAsync();

    expect([before, fading.isConnected, shown.isConnected, shown.parentElement?.isConnected, document.querySelectorAll(".nol-dialog-backdrop").length, opener.inert])
      .toEqual([[true, true], false, true, true, 1, true]);
  });

  it("takes a closed dialog's backdrop away at the overlay's own limit, 500ms, when its fade hasn't ended by then, as in a hidden window", async () => {
    useTestTime();
    const [reference, backdrop] = await openShownAsync();
    references = [];
    reference.close();
    backdrop.getAnimations().forEach(t => t.pause());
    time.advance(499);
    const before = [backdrop.isConnected, backdrop.getAnimations().length];
    time.advance(1);

    expect([before, backdrop.isConnected, document.querySelectorAll(".cdk-overlay-container > .cdk-overlay-popover").length]).toEqual([[true, 1], false, 0]);
  });

  it("takes a closed dialog's backdrop away at once, with no fade, when a dialog opened after it stays open, so that dialog never shows under it", async () => {
    const [first, lower] = await openShownAsync();
    const [, upper] = await openShownAsync();
    references = references.slice(1);

    first.close();
    const after = [lower.isConnected, lower.getAnimations().length, document.elementFromPoint(1, 1) === upper, document.activeElement === insideOf(0), opener.inert];
    await settleAsync();

    expect(after).toEqual([false, 0, true, true, true]);
    expect(document.querySelectorAll(".nol-dialog-backdrop").length).toBe(1);
  });

  it("lifts the inert window and returns the focus when the app goes with a dialog open, leaving no dialog or backdrop behind", async () => {
    await openShownAsync();
    references = [];

    TestBed.resetTestingModule();
    await settleAsync();

    expect([opener.inert, document.activeElement === opener, document.querySelectorAll("[role='dialog'], .nol-dialog-backdrop").length]).toEqual([false, true, 0]);
  });

  it("takes a closed dialog's backdrop away at once when reduced motion is preferred, or when it closes before its first frame", async () => {
    const early = TestBed.inject(DialogService).open(OpenDialogComponent, ".inside");
    const earlyBackdrop = early.overlayRef.backdropElement as HTMLElement;
    early.close();
    const earlyFades = earlyBackdrop.getAnimations().length;
    await MotionFixture.reduceAsync();
    try {
      const [reference, backdrop] = await openShownAsync();
      references = [];
      reference.close();
      const fades = backdrop.getAnimations().length;
      await settleAsync();

      expect([earlyFades, fades, earlyBackdrop.isConnected, backdrop.isConnected, document.querySelectorAll(".cdk-overlay-container > .cdk-overlay-popover").length]).toEqual([0, 0, false, false, 0]);
    }
    finally {
      await MotionFixture.resetAsync();
    }
  });

  it("shows a dialog opened while another's backdrop fades out above that backdrop, with its own, and leaves only its own once the fade ends", async () => {
    const [first, fading] = await openShownAsync();
    references = [];

    first.close();
    const fades = fading.getAnimations();
    fades.forEach(t => t.pause());
    const second = TestBed.inject(DialogService).open(OpenDialogComponent, ".inside");
    references.push(second);
    const shown = second.overlayRef.backdropElement as HTMLElement;
    second.overlayRef.updatePosition();
    const order = [...document.querySelectorAll(":popover-open")].filter(t => t.contains(fading) || t.contains(shown)).map(t => t.contains(fading) ? "fading" : "shown");
    const meanwhile = [document.querySelectorAll(".nol-dialog-backdrop").length, document.elementFromPoint(1, 1) === shown, opener.inert];
    fades.forEach(t => t.finish());
    await settleAsync();

    expect([order, meanwhile]).toEqual([["fading", "shown"], [2, true, true]]);
    const left = [...document.querySelectorAll(".nol-dialog-backdrop")];
    expect([left.length, left[0] === shown, second.overlayRef.backdropElement === shown, opener.inert]).toEqual([1, true, true, true]);
  });
});
