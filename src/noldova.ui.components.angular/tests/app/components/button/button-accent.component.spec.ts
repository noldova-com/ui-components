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
import { ButtonSize } from "../../../../src/app/enums/button-size";
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
    <button type="button" class="accent" data-testid="accent" nol-button [variant]="accent">Open</button>
    <button type="button" class="compact" nol-button [variant]="accent" [size]="compact">Open</button>
    <button type="button" class="disabled" nol-button [variant]="accent" disabled>Open</button>
    <button type="button" class="locked" data-testid="locked" nol-button [variant]="accent" aria-disabled="true">Open</button>
  `
})
class AccentButtonHostComponent {
  protected readonly accent: ButtonVariant = ButtonVariant.Accent;
  protected readonly compact: ButtonSize = ButtonSize.Compact;
}

describe("ButtonComponent's accent variant", () => {
  let fixture: ComponentFixture<AccentButtonHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(AccentButtonHostComponent);
    fixture.detectChanges();
  }

  const button = (name: string): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), `button.${name}`, HTMLButtonElement);
  const label = (name: string): DOMRect => DomFixture.one(button(name), "[data-truncates]").getBoundingClientRect();
  const toolbarHover = (): string => {
    const probe = document.body.appendChild(document.createElement("div"));
    probe.style.backgroundColor = "var(--nol-toolbar-hover)";
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  };

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows a chip-high button at the chip's side padding, with no fill, a one-pixel border and its label in the accent color, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const style = getComputedStyle(button("accent"));
        const box = button("accent").getBoundingClientRect();
        const text = label("accent");
        const border = AppearanceFixture.measureLook("border-width");
        const padding = AppearanceFixture.measureLook("chip-padding");
        const accent = AppearanceFixture.readColor(theme, mode, "accent");

        expect([style.backgroundColor, style.borderTopStyle, style.borderTopColor, style.color]).toEqual(["rgba(0, 0, 0, 0)", "solid", accent, accent]);
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        AppearanceFixture.expectPixels(parseFloat(style.borderTopWidth), border);
        AppearanceFixture.expectPixels(box.height, AppearanceFixture.measureLook("chip"));
        AppearanceFixture.expectPixels(text.top - box.top, box.bottom - text.bottom);
        AppearanceFixture.expectPixels(text.left - box.left, border + padding);
        AppearanceFixture.expectPixels(box.right - text.right, border + padding);
        expect(style.fontSize).toBe(getComputedStyle(button("primary")).fontSize);
      });

  it("keeps the chip's height and side padding at the compact size", () => {
    render();
    const [normal, compact] = [button("accent").getBoundingClientRect(), button("compact").getBoundingClientRect()];

    AppearanceFixture.expectPixels(compact.height, normal.height);
    AppearanceFixture.expectPixels(compact.width, normal.width);
    AppearanceFixture.expectPixels(compact.height, AppearanceFixture.measureLook("chip"));
  });

  for (const mode of AppearanceFixture.modes)
    it(`fills with the toolbar hover color under the pointer and keeps its accent border and label, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      const hover = toolbarHover();
      const accent = AppearanceFixture.readColor(DefaultTheme.theme, mode, "accent");

      await userEvent.hover(page.getByTestId("accent"));
      const style = getComputedStyle(button("accent"));

      expect([button("accent").matches(":hover"), style.backgroundColor, style.borderTopColor, style.color]).toEqual([true, hover, accent, accent]);
      expect(hover).not.toBe("rgba(0, 0, 0, 0)");
    });

  it("shows keyboard focus as the accent outline outside its border", async () => {
    render();

    button("primary").focus();
    await userEvent.tab();
    const style = getComputedStyle(button("accent"));

    expect(document.activeElement).toBe(button("accent"));
    expect([style.outlineStyle, style.outlineColor, style.outlineOffset]).toEqual(["solid", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent"), "2px"]);
  });

  it("looks disabled without the hover fill while disabled or aria-disabled, the aria-disabled one staying focusable", async () => {
    render();

    await userEvent.hover(page.getByTestId("locked"));
    button("locked").focus();
    const locked = getComputedStyle(button("locked"));
    const disabled = getComputedStyle(button("disabled"));

    expect([button("locked").matches(":hover"), locked.opacity, locked.cursor, locked.backgroundColor]).toEqual([true, "0.5", "default", "rgba(0, 0, 0, 0)"]);
    expect([disabled.opacity, disabled.cursor, disabled.backgroundColor]).toEqual(["0.5", "default", "rgba(0, 0, 0, 0)"]);
    expect(document.activeElement).toBe(button("locked"));
  });

  for (const mode of AppearanceFixture.modes)
    it(`keeps a ButtonText border and label under forced colors, or GrayText while disabled, at the same size, and shows hover as the dashed Highlight outline, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      const before = button("accent").getBoundingClientRect();
      await ForcedColorsFixture.activateAsync();
      const look = (name: string): readonly unknown[] => {
        const style = getComputedStyle(button(name));
        return [style.borderTopStyle, parseFloat(style.borderTopWidth), style.borderTopColor, style.color];
      };
      const width = AppearanceFixture.measureLook("border-width");
      const after = button("accent").getBoundingClientRect();

      expect([look("accent"), look("disabled"), look("locked")]).toEqual([
        ["solid", width, ForcedColorsFixture.resolve("ButtonText"), ForcedColorsFixture.resolve("ButtonText")],
        ["solid", width, ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")],
        ["solid", width, ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")]
      ]);
      AppearanceFixture.expectPixels(after.width, before.width);
      AppearanceFixture.expectPixels(after.height, before.height);

      await userEvent.hover(page.getByTestId("accent"));
      const hovered = getComputedStyle(button("accent"));

      expect([hovered.outlineStyle, hovered.outlineColor]).toEqual(["dashed", ForcedColorsFixture.resolve("Highlight")]);
    });
});
