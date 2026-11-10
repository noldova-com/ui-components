/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";
import { page, userEvent } from "vitest/browser";

import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [IconButtonComponent],
  template: `
    <button type="button" class="plain" nol-icon-button icon="add" label="Add files"></button>
    <button type="button" class="send" data-testid="send" nol-icon-button icon="send" label="Send" [filled]="true"></button>
    <button type="button" class="off" nol-icon-button icon="send" label="Send" [filled]="true" disabled></button>
    <button type="button" class="locked" nol-icon-button icon="send" label="Send" [filled]="true" aria-disabled="true"></button>
  `
})
class FilledIconButtonHostComponent {}

describe("IconButtonComponent's filled look", () => {
  let fixture: ComponentFixture<FilledIconButtonHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(FilledIconButtonHostComponent);
    fixture.detectChanges();
  }

  const button = (name: string): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), `button.${name}`, HTMLButtonElement);
  const pad = (name: string): CSSStyleDeclaration => getComputedStyle(button(name), "::before");
  const glyph = (name: string): DOMRect => DomFixture.one(button(name), ".nol-icon-button-glyph").getBoundingClientRect();
  const center = (box: DOMRect): readonly [number, number] => [box.left + box.width / 2, box.top + box.height / 2];

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`fills a circle the button height across with the button color and its glyph in the button text color, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const height = AppearanceFixture.measureLook("button-height");
        const box = button("send").getBoundingClientRect();
        const [glyphX, glyphY] = center(glyph("send"));
        const [boxX, boxY] = center(box);

        expect(button("send").classList.contains("nol-icon-button-filled")).toBe(true);
        expect(button("plain").classList.contains("nol-icon-button-filled")).toBe(false);
        expect([pad("send").backgroundColor, getComputedStyle(button("send")).color, pad("send").borderTopLeftRadius])
          .toEqual([AppearanceFixture.readColor(theme, mode, "button"), AppearanceFixture.readColor(theme, mode, "button-text"), "50%"]);
        AppearanceFixture.expectLook(pad("send").width, theme, "button-height", "width");
        AppearanceFixture.expectLook(pad("send").height, theme, "button-height", "height");
        AppearanceFixture.expectPixels(box.width, Math.max(24, height));
        AppearanceFixture.expectPixels(box.height, Math.max(24, height));
        AppearanceFixture.expectPixels(glyphX, boxX);
        AppearanceFixture.expectPixels(glyphY, boxY);
        AppearanceFixture.expectLook(getComputedStyle(DomFixture.one(button("send"), ".nol-icon-button-glyph")).fontSize, theme, "icon", "font-size");
      });

  it("keeps its fill under the pointer, without the hover fill of an icon button", async () => {
    render(DefaultTheme.theme, ThemeMode.Dark);

    await userEvent.hover(page.getByTestId("send"));

    expect(pad("send").backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Dark, "button"));
  });

  it("shows keyboard focus as the accent outline outside its circle", async () => {
    render();

    button("plain").focus();
    await userEvent.tab();

    expect(document.activeElement).toBe(button("send"));
    expect([pad("send").outlineStyle, pad("send").outlineWidth, pad("send").outlineColor])
      .toEqual(["solid", "1px", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent")]);
    AppearanceFixture.expectPixels(parseFloat(pad("send").outlineOffset), AppearanceFixture.measureLook("border-width") * 2);
  });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its circle in the widget border color with a muted glyph while disabled or aria-disabled, at full opacity, the same size, under the pointer too, in ${mode} mode`, () => {
      render(DefaultTheme.theme, mode);

      for (const name of ["off", "locked"]) {
        button(name).setAttribute("data-nol-state", "Hover");
        const style = getComputedStyle(button(name));

        expect([pad(name).backgroundColor, style.color, style.opacity, style.cursor])
          .toEqual([AppearanceFixture.readColor(DefaultTheme.theme, mode, "widget-border"), AppearanceFixture.readColor(DefaultTheme.theme, mode, "text-muted"), "1", "default"]);
        AppearanceFixture.expectPixels(button(name).getBoundingClientRect().width, button("send").getBoundingClientRect().width);
        AppearanceFixture.expectLook(pad(name).width, DefaultTheme.theme, "button-height", "width");
      }
    });

  for (const mode of AppearanceFixture.modes)
    it(`is a ButtonText ring around a ButtonText glyph under forced colors, or GrayText while disabled or aria-disabled, at the same size, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      const before = [button("send").getBoundingClientRect().width, parseFloat(pad("send").width)];
      await ForcedColorsFixture.activateAsync();
      const width = AppearanceFixture.measureLook("border-width");
      const ring = (name: string): readonly unknown[] => [pad(name).borderTopStyle, parseFloat(pad(name).borderTopWidth), pad(name).borderTopColor, getComputedStyle(button(name)).color];

      expect([ring("send"), ring("off"), ring("locked")]).toEqual([
        ["solid", width, ForcedColorsFixture.resolve("ButtonText"), ForcedColorsFixture.resolve("ButtonText")],
        ["solid", width, ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")],
        ["solid", width, ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")]
      ]);
      AppearanceFixture.expectPixels(button("send").getBoundingClientRect().width, before[0] as number);
      AppearanceFixture.expectPixels(parseFloat(pad("send").width), before[1] as number);
    });
});
