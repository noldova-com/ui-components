/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ErrorHandler, PLATFORM_ID } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { SiteThemeSwitchComponent } from "../../../../src/app/components/site-theme-switch/site-theme-switch.component";
import { TooltipFixture } from "../../../../src/testing/models/tooltip-fixture";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomChangeFixture } from "../../../fixtures/dom-change.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [SiteThemeSwitchComponent],
  template: "<nol-site-theme-switch />"
})
class SiteThemeSwitchHostComponent {
}

class StoredCase {
  public readonly stored: string;
  public readonly label: string;
  public readonly mode: string | null;

  public constructor(stored: string, label: string, mode: string | null) {
    this.stored = stored;
    this.label = label;
    this.mode = mode;
  }
}

describe("SiteThemeSwitchComponent", () => {
  const key = "noldova-theme";
  const modeAttribute = "data-nol-theme-mode";
  let fixture: ComponentFixture<SiteThemeSwitchHostComponent>;

  async function renderAsync(theme = AppearanceFixture.themes[0], mode = AppearanceFixture.modes[0]): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(SiteThemeSwitchHostComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function chooseAsync(label: string): Promise<void> {
    await userEvent.click(DomFixture.one(DomFixture.host(fixture), `[aria-label="${label}"]`));
    await fixture.whenStable();
  }

  const pills = (): HTMLButtonElement[] => DomFixture.allOf(DomFixture.host(fixture), ".nol-choice-pill", HTMLButtonElement);
  const checked = (): (string | null)[] => pills().filter(t => t.getAttribute("aria-checked") === "true").map(t => t.getAttribute("aria-label"));
  const shownMode = (): string | null => document.documentElement.getAttribute(modeAttribute);
  const switchHost = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-site-theme-switch");
  const glyphColor = (pill: Element): string => getComputedStyle(DomFixture.one(pill, ".nol-choice-pill-glyph")).color;
  const headCases: readonly StoredCase[] = [new StoredCase("light", "Light", "Light"), new StoredCase("dark", "Dark", "Dark"), new StoredCase("system", "System", null)];

  async function prerenderAsync(mode: string | null, theme = AppearanceFixture.themes[0], appearance = AppearanceFixture.modes[0]): Promise<void> {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: "server" }] });
    vi.stubGlobal("ngServerMode", true);
    if (Object.isNull(mode))
      document.documentElement.removeAttribute(modeAttribute);
    else
      document.documentElement.setAttribute(modeAttribute, mode);
    await renderAsync(theme, appearance);
  }

  beforeEach(() => localStorage.removeItem(key));

  afterEach(async () => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    await ForcedColorsFixture.resetAsync();
    localStorage.removeItem(key);
    document.documentElement.removeAttribute(modeAttribute);
    AppearanceFixture.reset();
  });

  it("offers Light, Dark and System in that order, as a group named Theme of icon pills named by their titles", async () => {
    await renderAsync();

    expect(DomFixture.one(switchHost(), "[role=radiogroup]").getAttribute("aria-label")).toBe("Theme");
    expect(pills().map(t => [t.getAttribute("aria-label"), t.textContent?.trim()])).toEqual([["Light", "light_mode"], ["Dark", "dark_mode"], ["System", "desktop_windows"]]);
  });

  it("shows each pill's title as its tooltip on hover, with the tooltip's engine loaded once the switch renders", async () => {
    TestBed.configureTestingModule({ providers: [TooltipFixture.atOnce] });
    await renderAsync();
    const shown: (string | undefined)[] = [];
    for (const pill of pills()) {
      await userEvent.hover(pill);
      shown.push(await DomChangeFixture.untilAsync(() => {
        const tip = document.querySelector(".cdk-overlay-container nol-tooltip")?.textContent?.trim();
        expect(tip).toBe(pill.getAttribute("aria-label"));
        return tip;
      }));
    }

    expect(shown).toEqual(["Light", "Dark", "System"]);
  });

  it("follows the system with nothing saved", async () => {
    await renderAsync();

    expect([checked(), shownMode()]).toEqual([["System"], null]);
  });

  for (const { stored, label, mode } of [new StoredCase("light", "Light", "Light"), new StoredCase("dark", "Dark", "Dark"), new StoredCase("system", "System", null),
    new StoredCase("sepia", "System", null)])
    it(`shows and applies ${label} once it renders when ${stored} is saved`, async () => {
      localStorage.setItem(key, stored);
      await renderAsync();

      expect([checked(), shownMode()]).toEqual([[label], mode]);
    });

  it("saves and applies each choice, and removes the mode for System", async () => {
    await renderAsync();
    const seen: unknown[] = [];

    for (const label of ["Dark", "Light", "System"]) {
      await chooseAsync(label);
      seen.push([checked(), shownMode(), localStorage.getItem(key)]);
    }

    expect(seen).toEqual([[["Dark"], "Dark", "dark"], [["Light"], "Light", "light"], [["System"], null, "system"]]);
  });

  it("applies a choice the browser refuses to save", async () => {
    await renderAsync();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("The storage is full.", "QuotaExceededError");
    });

    await chooseAsync("Dark");

    expect([checked(), shownMode(), localStorage.getItem(key)]).toEqual([["Dark"], "Dark", null]);
  });

  it("follows the system when the browser refuses to read the saved choice", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("The storage is blocked.", "SecurityError");
    });

    await renderAsync();

    expect([checked(), shownMode()]).toEqual([["System"], null]);
  });

  it("reports a failure to save that is not the browser's refusal, after applying the choice", async () => {
    const errors: unknown[] = [];
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (error: unknown) => errors.push(error) } });
    await renderAsync();
    const failure = new TypeError("The storage broke.");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw failure;
    });

    await chooseAsync("Dark");

    expect([shownMode(), errors.length > 0, errors.every(t => t === failure)]).toEqual(["Dark", true, true]);
  });

  it("reports a failure to read that is not the browser's refusal", async () => {
    const errors: unknown[] = [];
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError: (error: unknown) => errors.push(error) } });
    const failure = new TypeError("The storage broke.");
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw failure;
    });

    await renderAsync();

    expect([checked(), shownMode(), errors]).toEqual([["System"], null, [failure]]);
  });

  it("checks no pill and marks itself pending when it is prerendered, as it can't read the saved choice", async () => {
    localStorage.setItem(key, "dark");
    await prerenderAsync("Dark");

    expect([checked(), switchHost().classList.contains("nol-site-theme-switch-pending")]).toEqual([[], true]);
  });

  it("is not pending once it renders in the browser", async () => {
    await renderAsync();

    expect(switchHost().classList.contains("nol-site-theme-switch-pending")).toBe(false);
  });

  for (const { stored, label, mode } of headCases)
    it(`draws ${label} as chosen before hydration when the head script applies a saved ${stored}, in forced colors`, async () => {
      await ForcedColorsFixture.activateAsync();
      await prerenderAsync(mode);
      const chosen = DomFixture.one(switchHost(), `[aria-label="${label}"]`);
      const others = pills().filter(t => t !== chosen);
      const highlight = ForcedColorsFixture.resolve("Highlight");

      expect([getComputedStyle(chosen).backgroundColor, glyphColor(chosen)]).toEqual([highlight, ForcedColorsFixture.resolve("HighlightText")]);
      expect(others.map(t => getComputedStyle(t).backgroundColor === highlight)).toEqual([false, false]);
    });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes) {
      for (const stored of headCases)
        it(`draws ${stored.label} as chosen before hydration when the head script applies a saved ${stored.stored}, as the hydrated switch draws it, with the ${theme.id} theme in ${mode} mode`, async () => {
          await prerenderAsync(stored.mode, theme, mode);
          const chosen = DomFixture.one(switchHost(), `[aria-label="${stored.label}"]`);
          const others = pills().filter(t => t !== chosen);
          const face = getComputedStyle(chosen);

          expect([face.backgroundColor, glyphColor(chosen), face.boxShadow === "none"]).toEqual([AppearanceFixture.readColor(theme, mode, "panel"), AppearanceFixture.readColor(theme, mode, "accent"), false]);
          expect(others.map(t => [getComputedStyle(t).backgroundColor, getComputedStyle(t).boxShadow, glyphColor(t)].join(" ")))
            .toEqual(others.map(() => ["rgba(0, 0, 0, 0)", "none", AppearanceFixture.readColor(theme, mode, "text-muted")].join(" ")));
        });

      it(`sits on the raised color with the ${theme.id} theme's large radius, its pills at least pointer targets, each with a face at the site theme pill size centred in it, the faces the switch's padding from its edge and a half space apart or as close as the targets allow, in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const style = getComputedStyle(switchHost());
        const size = AppearanceFixture.measureLook("site-theme-pill");
        const target = Math.max(size, AppearanceFixture.measureLook("pointer-target"));
        const reach = (target - size) / 2;
        const half = AppearanceFixture.measureLook("space-half");
        const inset = Math.max(0, AppearanceFixture.measureLook("site-theme-switch-padding") - reach);
        const gap = Math.max(0, half - reach * 2);
        const outer = switchHost().getBoundingClientRect();
        const boxes = pills().map(t => t.getBoundingClientRect());

        expect(style.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "raised"));
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-large", "border-top-left-radius");
        expect(style.borderTopWidth).toBe("0px");
        for (const pill of pills()) {
          const box = pill.getBoundingClientRect();
          const face = getComputedStyle(pill);
          const sides = [face.paddingTop, face.paddingRight, face.paddingBottom, face.paddingLeft].map(t => Number.parseFloat(t));
          AppearanceFixture.expectPixels(box.width, target);
          AppearanceFixture.expectPixels(box.height, target);
          for (const side of sides)
            AppearanceFixture.expectPixels(side, reach);
          expect(face.backgroundClip).toBe("content-box");
        }
        AppearanceFixture.expectPixels(DomFixture.at(boxes, 0).left - outer.left, inset);
        AppearanceFixture.expectPixels(outer.right - DomFixture.at(boxes, 2).right, inset);
        AppearanceFixture.expectPixels(outer.height, target + inset * 2);
        AppearanceFixture.expectPixels(DomFixture.at(boxes, 1).left - DomFixture.at(boxes, 0).right, gap);
        AppearanceFixture.expectPixels(DomFixture.at(boxes, 2).left - DomFixture.at(boxes, 1).right, gap);
      });

      it(`draws the chosen pill on the panel color with a shadow and the medium radius, its icon in the accent color, and the others' icons muted at the header icon size, with the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const chosen = DomFixture.one(DomFixture.host(fixture), ".nol-choice-pill-selected");
        const others = pills().filter(t => t !== chosen);
        const glyph = (pill: Element): CSSStyleDeclaration => getComputedStyle(DomFixture.one(pill, ".nol-choice-pill-glyph"));
        const face = getComputedStyle(chosen);

        expect([face.backgroundColor, glyph(chosen).color, face.boxShadow === "none"]).toEqual([AppearanceFixture.readColor(theme, mode, "panel"), AppearanceFixture.readColor(theme, mode, "accent"), false]);
        AppearanceFixture.expectLook(face.borderTopLeftRadius, theme, "radius-medium", "border-top-left-radius");
        expect(others.map(t => glyph(t).color)).toEqual(others.map(() => AppearanceFixture.readColor(theme, mode, "text-muted")));
        for (const pill of pills())
          AppearanceFixture.expectPixels(Number.parseFloat(glyph(pill).fontSize), AppearanceFixture.measureLook("site-header-icon"));
      });
    }
});
