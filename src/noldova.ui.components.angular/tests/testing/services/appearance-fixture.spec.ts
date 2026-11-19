/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TestBed } from "@angular/core/testing";
import { onTestFinished, vi } from "vitest";
import { userEvent } from "vitest/browser";

import { ThemeMode } from "../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../src/app/models/default-theme";
import { ScrollRevealResources } from "../../../src/app/services/scroll-reveal.resources";
import { ScrollRevealService } from "../../../src/app/services/scroll-reveal.service";
import { FixtureTheme } from "../../../src/testing/models/fixture-theme";
import { AppearanceFixture } from "../../../src/testing/services/appearance-fixture";
import { PointerFixture } from "../../../src/testing/services/pointer-fixture";
import { PointerRestFixture } from "../../fixtures/pointer-rest.fixture";

describe("AppearanceFixture", () => {
  afterEach(() => AppearanceFixture.reset());

  it("paints the document's root with a theme in a mode and a panel size, and reset removes it with the tab shape", () => {
    const root = document.documentElement;

    AppearanceFixture.apply(FixtureTheme.theme, ThemeMode.Dark, 16);
    const painted = getComputedStyle(root).getPropertyValue("--nol-panel");
    root.setAttribute("data-nol-tab-shape", "pill");
    AppearanceFixture.reset();

    expect(painted.toUpperCase()).toBe("#2002A0");
    expect([root.style.length, root.hasAttribute("data-nol-tab-shape")]).toEqual([0, false]);
  });

  it("converts rem into pixels at a panel size, 13 by default", () => {
    expect([AppearanceFixture.toPixels(1), AppearanceFixture.toPixels(1.5, 13), AppearanceFixture.toPixels(1, 26)]).toEqual([16, 24, 32]);
  });

  it("reads a theme's color as the browser computes it, and refuses a color or look the theme lacks", () => {
    const missing = FixtureTheme.create(new Map());

    expect(AppearanceFixture.readColor(FixtureTheme.theme, ThemeMode.Light, "panel")).toBe("rgb(160, 2, 16)");
    expect(() => AppearanceFixture.readColor(FixtureTheme.theme, ThemeMode.Light, "missing")).toThrow(new Error("The theme fixture.contrast has no missing color."));
    expect(() => AppearanceFixture.expectLook("0px", missing, "radius-small", "border-top-left-radius", "border-radius"))
      .toThrow(new Error("The theme fixture.contrast has no radius-small value."));
  });

  it("computes the contrast of two colors from 1 to 21 in either order, reading a color without channels as black", () => {
    expect(AppearanceFixture.contrast("rgb(0, 0, 0)", "rgb(255, 255, 255)")).toBeCloseTo(21, 5);
    expect(AppearanceFixture.contrast("rgb(255, 255, 255)", "rgb(0, 0, 0)")).toBeCloseTo(21, 5);
    expect(AppearanceFixture.contrast("rgb(10, 20, 30)", "rgb(10, 20, 30)")).toBe(1);
    expect(AppearanceFixture.contrast("none", "rgb(0, 0, 0)")).toBe(1);
  });

  it("parks the pointer outside the page, over none of its elements, so the move off the page after the test has none to make, and shows a 4 px element in the top left corner", async () => {
    const cover = document.body.appendChild(document.createElement("div"));
    cover.style.cssText = "position: fixed; inset: 0;";
    onTestFinished(() => cover.remove());
    await PointerFixture.hoverAsync(cover, { isForced: true });
    const before = [cover.matches(":hover"), PointerRestFixture.moved];

    const park = await AppearanceFixture.parkPointerAsync();
    onTestFinished(() => park.remove());
    const box = park.getBoundingClientRect();
    const hover = vi.spyOn(userEvent, "hover");
    onTestFinished(() => hover.mockRestore());
    await PointerRestFixture.leavePageAsync();

    expect([before, [...document.querySelectorAll(":hover")], PointerRestFixture.moved, hover.mock.calls.length]).toEqual([[true, true], [], false, 0]);
    expect([park.matches(":popover-open"), box.left, box.top, box.width, box.height]).toEqual([true, 0, 0, 4, 4]);
  });

  it("fails and removes the park when the pointer cannot move", async () => {
    const failure = new Error("The pointer did not move.");
    const hover = vi.spyOn(userEvent, "hover").mockRejectedValueOnce(failure);
    onTestFinished(() => hover.mockRestore());
    const before = document.body.childElementCount;

    await expect(AppearanceFixture.parkPointerAsync()).rejects.toBe(failure);
    expect(document.body.childElementCount).toBe(before);
  });

  it("fails naming what the pointer still hovers, and removes the park, when the pointer stays in the page", async () => {
    const cover = document.body.appendChild(document.createElement("section"));
    cover.style.cssText = "position: fixed; inset: 0;";
    onTestFinished(() => cover.remove());
    await PointerFixture.hoverAsync(cover, { isForced: true });
    const hover = vi.spyOn(userEvent, "hover").mockResolvedValueOnce(undefined);
    onTestFinished(() => hover.mockRestore());
    const before = document.body.childElementCount;

    await expect(AppearanceFixture.parkPointerAsync()).rejects.toThrow("The pointer did not leave the page; it still hovers section.");
    expect(document.body.childElementCount).toBe(before);
  });

  it("waits out a scroll's reveal and the thumb's transitions before it reads the thumb hidden, and then shown on hover", async () => {
    AppearanceFixture.apply();
    TestBed.inject(ScrollRevealService);
    const area = document.body.appendChild(document.createElement("div"));
    area.style.cssText = "position: fixed; top: 0; left: 0; width: 200px; height: 120px; overflow: scroll;";
    area.appendChild(document.createElement("div")).style.cssText = "height: 600px;";
    onTestFinished(() => area.remove());
    const scrolled = new Promise(resolve => area.addEventListener("scroll", resolve, { once: true }));
    area.scrollTop = 40;
    await scrolled;
    const revealed = area.hasAttribute(ScrollRevealResources.scrollingAttribute);

    await AppearanceFixture.expectThumbRevealsOnHoverAsync(area);

    expect([revealed, area.hasAttribute(ScrollRevealResources.scrollingAttribute)]).toEqual([true, false]);
  });

  for (const [what, hold, still] of [
    ["a scroll's reveal", (area: HTMLElement): void => area.setAttribute(ScrollRevealResources.scrollingAttribute, String.empty), `showed a scroll's reveal, [${ScrollRevealResources.scrollingAttribute}]`],
    ["a transition", (area: HTMLElement): void => void area.animate({ opacity: [1, 0] }, 60_000), "ran a transition"]
  ] as const)
    it(`fails naming ${what} the area still shows once it has waited 15 seconds for it to end, and not before`, async () => {
      const area = document.body.appendChild(document.createElement("div"));
      onTestFinished(() => area.remove());
      hold(area);
      const park = vi.spyOn(AppearanceFixture, "parkPointerAsync").mockResolvedValue(document.createElement("div"));
      onTestFinished(() => park.mockRestore());
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
      onTestFinished(() => {
        vi.useRealTimers();
      });
      let failure: unknown;
      const checking = AppearanceFixture.expectThumbRevealsOnHoverAsync(area).catch((error: unknown) => {
        failure = error;
      });

      await vi.advanceTimersByTimeAsync(15_000 - 1);
      const early = failure;
      await vi.advanceTimersByTimeAsync(1);
      await checking;

      expect([early, failure]).toEqual([undefined, new Error(`The scroll area still ${still} after 15000 ms.`)]);
    });

  it("names both modes and both themes", () => {
    expect(AppearanceFixture.modes).toEqual([ThemeMode.Light, ThemeMode.Dark]);
    expect(AppearanceFixture.themes).toEqual([DefaultTheme.theme, FixtureTheme.theme]);
  });
});
