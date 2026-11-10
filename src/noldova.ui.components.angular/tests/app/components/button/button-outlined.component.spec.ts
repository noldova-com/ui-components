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

import { ButtonComponent } from "../../../../src/app/components/button/button.component";
import { ButtonVariant } from "../../../../src/app/enums/button-variant";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [ButtonComponent],
  template: `
    <button type="button" class="primary" nol-button>Send</button>
    <button type="button" class="outlined" data-testid="outlined" nol-button [variant]="outlined">Ask first</button>
    <button type="button" class="glyph" nol-button [variant]="outlined"><span nolButtonIcon class="shield" style="width: 1rem">+</span>Full access</button>
    <button type="button" class="disabled" nol-button [variant]="outlined" disabled>Ask first</button>
    <button type="button" class="locked" data-testid="locked" nol-button [variant]="outlined" aria-disabled="true">Ask first</button>
  `
})
class OutlinedButtonHostComponent {
  protected readonly outlined: ButtonVariant = ButtonVariant.Outlined;
}

describe("ButtonComponent's outlined variant", () => {
  let fixture: ComponentFixture<OutlinedButtonHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(OutlinedButtonHostComponent);
    fixture.detectChanges();
  }

  const button = (name: string): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), `button.${name}`, HTMLButtonElement);
  const label = (name: string): DOMRect => DomFixture.one(button(name), "[data-truncates]").getBoundingClientRect();

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows a compact button, a quarter step above and below its label, with no fill, a one-pixel border in the border color and its label muted, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const style = getComputedStyle(button("outlined"));
        const box = button("outlined").getBoundingClientRect();
        const text = label("outlined");
        const border = AppearanceFixture.measureLook("border-width");
        const space = AppearanceFixture.measureLook("space-1");
        const padding = AppearanceFixture.measureLook("button-padding");

        expect([style.backgroundColor, style.borderTopStyle, style.borderTopColor, style.color])
          .toEqual(["rgba(0, 0, 0, 0)", "solid", AppearanceFixture.readColor(theme, mode, "border"), AppearanceFixture.readColor(theme, mode, "text-muted")]);
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        AppearanceFixture.expectPixels(parseFloat(style.borderTopWidth), border);
        AppearanceFixture.expectPixels(text.top - box.top, border + space);
        AppearanceFixture.expectPixels(box.bottom - text.bottom, border + space);
        AppearanceFixture.expectPixels(text.left - box.left, border + padding);
        AppearanceFixture.expectPixels(box.right - text.right, border + padding);
        AppearanceFixture.expectPixels(text.height, parseFloat(getComputedStyle(button("primary")).lineHeight));
        expect(style.fontSize).toBe(getComputedStyle(button("primary")).fontSize);
      });

  it("puts its glyph, at the icon size, a quarter step before its label, at its start padding", () => {
    render();
    AppearanceFixture.expectLook(getComputedStyle(DomFixture.one(button("glyph"), ".shield")).fontSize, DefaultTheme.theme, "icon", "font-size");
    const glyph = DomFixture.one(button("glyph"), ".shield").getBoundingClientRect();
    const style = getComputedStyle(button("glyph"));

    AppearanceFixture.expectPixels(glyph.left - button("glyph").getBoundingClientRect().left, parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft));
    AppearanceFixture.expectPixels(label("glyph").left - glyph.right, AppearanceFixture.toPixels(0.25));
  });

  for (const mode of AppearanceFixture.modes)
    it(`keeps no fill under the pointer, without the primary button's hover fill, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);

      await userEvent.hover(page.getByTestId("outlined"));

      expect([button("outlined").matches(":hover"), getComputedStyle(button("outlined")).backgroundColor]).toEqual([true, "rgba(0, 0, 0, 0)"]);
    });

  it("shows keyboard focus as the accent outline outside its border", async () => {
    render();

    button("primary").focus();
    await userEvent.tab();
    const style = getComputedStyle(button("outlined"));

    expect(document.activeElement).toBe(button("outlined"));
    expect([style.outlineStyle, style.outlineColor, style.outlineOffset]).toEqual(["solid", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent"), "2px"]);
  });

  it("looks disabled without a hover fill while disabled or aria-disabled, the aria-disabled one staying focusable", async () => {
    render();

    await userEvent.hover(page.getByTestId("locked"));
    button("locked").focus();
    const locked = getComputedStyle(button("locked"));
    const disabled = getComputedStyle(button("disabled"));

    expect([locked.opacity, locked.cursor, locked.backgroundColor]).toEqual(["0.5", "default", "rgba(0, 0, 0, 0)"]);
    expect([disabled.opacity, disabled.cursor, disabled.backgroundColor]).toEqual(["0.5", "default", "rgba(0, 0, 0, 0)"]);
    expect(document.activeElement).toBe(button("locked"));
  });

  for (const mode of AppearanceFixture.modes)
    it(`keeps a ButtonText border and label under forced colors, or GrayText while disabled, at the same size, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      const before = button("outlined").getBoundingClientRect();
      await ForcedColorsFixture.activateAsync();
      const look = (name: string): readonly unknown[] => {
        const style = getComputedStyle(button(name));
        return [style.borderTopStyle, parseFloat(style.borderTopWidth), style.borderTopColor, style.color];
      };
      const width = AppearanceFixture.measureLook("border-width");
      const after = button("outlined").getBoundingClientRect();

      expect([look("outlined"), look("disabled"), look("locked")]).toEqual([
        ["solid", width, ForcedColorsFixture.resolve("ButtonText"), ForcedColorsFixture.resolve("ButtonText")],
        ["solid", width, ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")],
        ["solid", width, ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")]
      ]);
      AppearanceFixture.expectPixels(after.width, before.width);
      AppearanceFixture.expectPixels(after.height, before.height);
    });
});
