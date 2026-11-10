/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { userEvent } from "vitest/browser";

import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [IconButtonComponent],
  template: `
    <button type="button" class="plain" nol-icon-button icon="edit" label="Edit Docs"></button>
    <button type="button" class="danger" nol-icon-button icon="delete" label="Delete Docs" [danger]="true"></button>
    <button type="button" class="off" nol-icon-button icon="delete" label="Delete Docs" [danger]="true" disabled></button>
    <button type="button" class="filled" nol-icon-button icon="send" label="Send" [danger]="true" [filled]="true"></button>
    <button type="button" class="overlay" nol-icon-button icon="close" label="Remove" [danger]="true" [overlay]="true"></button>
    <button type="button" class="pressed" nol-icon-button icon="delete" label="Delete Docs" [danger]="true" [pressed]="true" style="--nol-error: rgb(1, 2, 3)"></button>
    <button type="button" class="plain-pressed" nol-icon-button icon="edit" label="Edit Docs" [pressed]="true"></button>
  `
})
class DangerIconButtonHostComponent {}

describe("IconButtonComponent's danger look", () => {
  let fixture: ComponentFixture<DangerIconButtonHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(DangerIconButtonHostComponent);
    fixture.detectChanges();
  }

  const button = (name: string): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), `button.${name}`, HTMLButtonElement);
  const pad = (name: string): CSSStyleDeclaration => getComputedStyle(button(name), "::before");
  const over = (fill: string, surface: string): string => {
    const [red = 0, green = 0, blue = 0, alpha = 1] = (fill.match(/\d+(\.\d+)?/gu) ?? []).map(Number);
    const under = (surface.match(/\d+/gu) ?? []).map(Number);
    return `rgb(${[red, green, blue].map((t, i) => Math.round(t * alpha + (under[i] ?? 0) * (1 - alpha))).join(", ")})`;
  };

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws its glyph in the error color, at the plain button's size, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);

        expect([getComputedStyle(button("danger")).color, getComputedStyle(button("plain")).color])
          .toEqual([AppearanceFixture.readColor(theme, mode, "error"), AppearanceFixture.readColor(theme, mode, "icon-color")]);
        expect([pad("danger").width, pad("danger").backgroundColor, button("danger").getBoundingClientRect().width])
          .toEqual([pad("plain").width, pad("plain").backgroundColor, button("plain").getBoundingClientRect().width]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps 3:1 against the panel and the toolbar hover, with the plain button's hover and focus, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      const panel = AppearanceFixture.readColor(DefaultTheme.theme, mode, "panel");
      const glyph = getComputedStyle(button("danger")).color;
      await userEvent.hover(button("danger"));
      const hover = pad("danger").backgroundColor;
      await userEvent.hover(button("plain"));

      expect(hover).toBe(pad("plain").backgroundColor);
      expect(glyph).toBe(AppearanceFixture.readColor(DefaultTheme.theme, mode, "error"));
      expect(AppearanceFixture.contrast(glyph, panel)).toBeGreaterThanOrEqual(3);
      expect(AppearanceFixture.contrast(glyph, over(hover, panel))).toBeGreaterThanOrEqual(3);

      button("plain").focus();
      await userEvent.tab();

      expect(document.activeElement).toBe(button("danger"));
      expect([pad("danger").outlineStyle, pad("danger").outlineColor]).toEqual(["solid", AppearanceFixture.readColor(DefaultTheme.theme, mode, "accent")]);
    });

  it("dims like the plain button while disabled, and leaves the filled and overlay looks their own colors", () => {
    render();

    expect([getComputedStyle(button("off")).opacity, getComputedStyle(button("off")).color]).toEqual(["0.5", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "error")]);
    expect([button("filled"), button("overlay")].map(t => t.classList.contains("nol-icon-button-danger"))).toEqual([false, false]);
    expect([getComputedStyle(button("filled")).color, getComputedStyle(button("overlay")).color])
      .toEqual([AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "button-text"), "rgb(255, 255, 255)"]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`is the plain button's ButtonText glyph under forced colors, and the plain pressed look's while pressed, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();

      expect(button("danger").classList.contains("nol-icon-button-danger")).toBe(true);
      expect([getComputedStyle(button("danger")).color, getComputedStyle(button("plain")).color])
        .toEqual([ForcedColorsFixture.resolve("ButtonText"), ForcedColorsFixture.resolve("ButtonText")]);
      expect([button("pressed"), button("plain-pressed")].map(t => [t.getAttribute("aria-pressed"), getComputedStyle(t).forcedColorAdjust])).toEqual([["true", "none"], ["true", "none"]]);
      expect([getComputedStyle(button("pressed")).color, pad("pressed").backgroundColor])
        .toEqual([getComputedStyle(button("plain-pressed")).color, pad("plain-pressed").backgroundColor]);
    });
});
