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

import { ToolbarButtonComponent } from "../../../../src/app/components/toolbar-button/toolbar-button.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { ToolbarButtonSize } from "../../../../src/app/enums/toolbar-button-size";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [ToolbarButtonComponent],
  template: `
    <button type="button" class="normal" nol-toolbar-button icon="more_horiz" label="More"></button>
    <button type="button" class="large" data-testid="large" nol-toolbar-button icon="more_horiz" label="More" [size]="large"></button>
    <button type="button" class="labeled" nol-toolbar-button icon="history" label="Versions" [isShowingLabel]="true" [hasMenu]="true" [size]="large"></button>
    <button type="button" class="pressed" nol-toolbar-button icon="wrap_text" label="Wrap" [pressed]="true" [size]="large"></button>
  `
})
class LargeToolbarButtonHostComponent {
  protected readonly large: ToolbarButtonSize = ToolbarButtonSize.Large;
}

describe("ToolbarButtonComponent's large size", () => {
  let fixture: ComponentFixture<LargeToolbarButtonHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(LargeToolbarButtonHostComponent);
    fixture.detectChanges();
  }

  const button = (name: string): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), `button.${name}`, HTMLButtonElement);
  const part = (name: string, selector: string): HTMLElement => DomFixture.one(button(name), selector);
  const middleX = (rect: DOMRect): number => rect.left + rect.width / 2;
  const middleY = (rect: DOMRect): number => rect.top + rect.height / 2;
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
      it(`draws a large square with its larger glyph centered in it, and a labeled one as high with the pill padding and the normal chevron, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const size = AppearanceFixture.measureLook("toolbar-button-large");
        const box = button("large").getBoundingClientRect();
        const glyph = part("large", ".nol-toolbar-button-glyph");
        const labeled = button("labeled").getBoundingClientRect();
        const padding = AppearanceFixture.measureLook("pill-padding");

        AppearanceFixture.expectPixels(box.width, size);
        AppearanceFixture.expectPixels(box.height, size);
        AppearanceFixture.expectLook(getComputedStyle(glyph).fontSize, theme, "toolbar-button-large-icon", "font-size");
        AppearanceFixture.expectPixels(middleX(glyph.getBoundingClientRect()), middleX(box));
        AppearanceFixture.expectPixels(middleY(glyph.getBoundingClientRect()), middleY(box));
        AppearanceFixture.expectLook(getComputedStyle(button("large")).borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        AppearanceFixture.expectPixels(labeled.height, size);
        AppearanceFixture.expectPixels(part("labeled", ".nol-toolbar-button-glyph").getBoundingClientRect().left - labeled.left, padding);
        AppearanceFixture.expectPixels(labeled.right - part("labeled", ".nol-toolbar-button-chevron").getBoundingClientRect().right, padding);
        AppearanceFixture.expectLook(getComputedStyle(part("labeled", ".nol-toolbar-button-chevron")).fontSize, theme, "icon", "font-size");
        AppearanceFixture.expectPixels(button("normal").getBoundingClientRect().height, AppearanceFixture.measureLook("toolbar-button"));
        AppearanceFixture.expectLook(getComputedStyle(part("normal", ".nol-toolbar-button-glyph")).fontSize, theme, "icon", "font-size");
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps the default size's hover and pressed fill and focus outline, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      const hover = toolbarHover();

      await userEvent.hover(page.getByTestId("large"));
      const hovered = getComputedStyle(button("large")).backgroundColor;
      button("normal").focus();
      await userEvent.tab();
      const focused = getComputedStyle(button("large"));

      expect([hovered, getComputedStyle(button("pressed")).backgroundColor]).toEqual([hover, hover]);
      expect(hover).not.toBe("rgba(0, 0, 0, 0)");
      expect(document.activeElement).toBe(button("large"));
      expect([focused.outlineStyle, focused.outlineColor]).toEqual(["solid", AppearanceFixture.readColor(DefaultTheme.theme, mode, "accent")]);
    });

  for (const mode of AppearanceFixture.modes)
    it(`keeps its size, and a pressed one its Highlight fill, under forced colors, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      const before = button("large").getBoundingClientRect();
      await ForcedColorsFixture.activateAsync();
      const after = button("large").getBoundingClientRect();

      AppearanceFixture.expectPixels(after.width, before.width);
      AppearanceFixture.expectPixels(after.height, before.height);
      expect(getComputedStyle(button("pressed")).backgroundColor).toBe(ForcedColorsFixture.resolve("Highlight"));
    });
});
