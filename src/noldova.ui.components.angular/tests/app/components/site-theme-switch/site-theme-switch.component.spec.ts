/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, ErrorHandler } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { userEvent } from "vitest/browser";

import { ChoicePillsComponent } from "../../../../src/app/components/choice-pills/choice-pills.component";
import { SiteThemeSwitchComponent } from "../../../../src/app/components/site-theme-switch/site-theme-switch.component";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";

@Component({
  imports: [SiteThemeSwitchComponent],
  template: "<nol-site-theme-switch />"
})
class SiteThemeSwitchHostComponent {
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

  beforeEach(() => localStorage.removeItem(key));

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.removeItem(key);
    document.documentElement.removeAttribute(modeAttribute);
    AppearanceFixture.reset();
  });

  it("offers Light, Dark and System in that order, as a group named Theme of icon pills named by their titles", async () => {
    await renderAsync();

    expect(DomFixture.one(switchHost(), "[role=radiogroup]").getAttribute("aria-label")).toBe("Theme");
    expect(pills().map(t => [t.getAttribute("aria-label"), t.textContent?.trim()])).toEqual([["Light", "light_mode"], ["Dark", "dark_mode"], ["System", "desktop_windows"]]);
  });

  it("follows the system with nothing saved", async () => {
    await renderAsync();

    expect([checked(), shownMode()]).toEqual([["System"], null]);
  });

  for (const [stored, label, mode] of [["light", "Light", "Light"], ["dark", "Dark", "Dark"], ["system", "System", null], ["sepia", "System", null]] as const)
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

  it("takes a value it does not offer as System", async () => {
    localStorage.setItem(key, "dark");
    await renderAsync();

    fixture.debugElement.query(By.directive(ChoicePillsComponent)).injector.get(ChoicePillsComponent).valueChange.emit("sepia");
    await fixture.whenStable();

    expect([checked(), shownMode(), localStorage.getItem(key)]).toEqual([["System"], null, "system"]);
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

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`sits on the window color with the ${theme.id} theme's half-space inset and medium radius, its pills square at the choice pill size, in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const style = getComputedStyle(switchHost());
        const size = AppearanceFixture.measureLook("choice-pill");
        const inset = AppearanceFixture.measureLook("space-half");
        const outer = switchHost().getBoundingClientRect();
        const first = DomFixture.at(pills(), 0).getBoundingClientRect();

        expect(style.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "window"));
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-medium", "border-top-left-radius");
        expect(style.borderTopWidth).toBe("0px");
        for (const rectangle of pills().map(t => t.getBoundingClientRect())) {
          AppearanceFixture.expectPixels(rectangle.width, size);
          AppearanceFixture.expectPixels(rectangle.height, size);
        }
        AppearanceFixture.expectPixels(first.left - outer.left, inset);
        AppearanceFixture.expectPixels(first.top - outer.top, inset);
        AppearanceFixture.expectPixels(outer.height, size + inset * 2);
      });
});
