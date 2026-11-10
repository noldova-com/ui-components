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

@Component({
  imports: [ButtonComponent],
  template: `
    <button type="button" class="primary" nol-button>Move aside</button>
    <button type="button" class="text" data-testid="text" nol-button [variant]="text">Restart</button>
    <button type="button" class="text-long" nol-button [variant]="text">Restart the terminal</button>
    <div style="width: 3rem"><button type="button" class="text-narrow" nol-button [variant]="text">OK</button></div>
    <div style="display: flex; flex-direction: column; width: 20rem"><button type="button" class="text-in-column" nol-button [variant]="text">OK</button></div>
    <div style="display: grid; width: 20rem"><button type="button" class="text-in-grid" nol-button [variant]="text">OK</button></div>
    <div class="row" style="display: inline-flex; align-items: center"><input class="neighbour" style="box-sizing: border-box; width: 6rem; margin: 0" /><button type="button" class="text-short" nol-button [variant]="text">OK</button></div>
    <button type="button" class="text-disabled" nol-button [variant]="text" disabled>Restart</button>
    <button type="button" class="text-locked" data-testid="text-locked" nol-button [variant]="text" aria-disabled="true">Restart</button>
  `
})
class TextButtonHostComponent {
  protected readonly text: ButtonVariant = ButtonVariant.Text;
}

describe("ButtonComponent's text variant", () => {
  let fixture: ComponentFixture<TextButtonHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(TextButtonHostComponent);
    fixture.detectChanges();
  }

  function button(variant: string): HTMLButtonElement {
    return DomFixture.oneOf(DomFixture.host(fixture), `button.${variant}`, HTMLButtonElement);
  }

  afterEach(() => AppearanceFixture.reset());

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows a text button with no fill or border in the text color of the ${theme.id} theme in ${mode} mode, at the button's height, padding, radius and label size`, () => {
        render(theme, mode);
        const text = button("text");
        const style = getComputedStyle(text);
        const primary = getComputedStyle(button("primary"));

        expect([style.backgroundColor, style.borderTopWidth, style.borderLeftWidth, style.color]).toEqual(["rgba(0, 0, 0, 0)", "0px", "0px", AppearanceFixture.readColor(theme, mode, "text")]);
        AppearanceFixture.expectLook(style.minHeight, theme, "button-height", "min-height");
        AppearanceFixture.expectLook(style.paddingLeft, theme, "button-padding", "padding-left");
        AppearanceFixture.expectLook(style.paddingRight, theme, "button-padding", "padding-right");
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        AppearanceFixture.expectPixels(text.getBoundingClientRect().height, parseFloat(primary.minHeight));
        expect([style.fontSize, style.lineHeight, style.fontWeight]).toEqual([primary.fontSize, primary.lineHeight, primary.fontWeight]);
      });

  it("is at least 4rem wide, its short label centered, a longer label at its padding, and no wider than its container", () => {
    render();
    const edges = (element: HTMLElement): readonly number[] => {
      const label = DomFixture.one(element, "[data-truncates]").getBoundingClientRect();
      return [label.left - element.getBoundingClientRect().left, element.getBoundingClientRect().right - label.right];
    };
    const [shortStart = 0, shortEnd = 0] = edges(button("text"));
    const [longStart = 0, longEnd = 0] = edges(button("text-long"));
    const padding = parseFloat(getComputedStyle(button("text")).paddingLeft);

    AppearanceFixture.expectPixels(button("text").getBoundingClientRect().width, AppearanceFixture.toPixels(4));
    AppearanceFixture.expectPixels(shortStart, shortEnd);
    expect(shortStart).toBeGreaterThan(padding);
    expect(button("text-long").getBoundingClientRect().width).toBeGreaterThan(AppearanceFixture.toPixels(4));
    AppearanceFixture.expectPixels(longStart, padding);
    AppearanceFixture.expectPixels(longEnd, padding);
    AppearanceFixture.expectPixels(button("text-narrow").getBoundingClientRect().width, AppearanceFixture.toPixels(3));
  });

  it("stretches to the width of a parent that stretches its children, in a column and in a grid", () => {
    render();

    AppearanceFixture.expectPixels(button("text-in-column").getBoundingClientRect().width, AppearanceFixture.toPixels(20));
    AppearanceFixture.expectPixels(button("text-in-grid").getBoundingClientRect().width, AppearanceFixture.toPixels(20));
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps its 4rem minimum in a row sized to its content, which grows to fit it beside its neighbour without overlapping it, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const row = DomFixture.one(DomFixture.host(fixture), ".row");
        const [neighbour, short] = [DomFixture.one(row, ".neighbour"), button("text-short")].map(t => t.getBoundingClientRect()) as [DOMRect, DOMRect];

        AppearanceFixture.expectPixels(short.width, AppearanceFixture.toPixels(4));
        AppearanceFixture.expectPixels(neighbour.width, AppearanceFixture.toPixels(6));
        AppearanceFixture.expectPixels(short.left, neighbour.right);
        AppearanceFixture.expectPixels(row.getBoundingClientRect().width, neighbour.width + short.width);
        expect([row.scrollWidth <= row.clientWidth, short.right <= row.getBoundingClientRect().right + 0.5]).toEqual([true, true]);
      });

  it("fills a text button with the toolbar hover color under the pointer and while it is pressed", async () => {
    render(DefaultTheme.theme, ThemeMode.Dark);
    const probe = DomFixture.host(fixture).appendChild(document.createElement("span"));
    probe.style.backgroundColor = "var(--nol-toolbar-hover)";
    const hover = getComputedStyle(probe).backgroundColor;
    probe.remove();

    await userEvent.hover(page.getByTestId("text"));
    const hovered = getComputedStyle(button("text")).backgroundColor;
    button("text").focus();
    await userEvent.keyboard("{Space>}");
    const pressed = [button("text").matches(":active"), getComputedStyle(button("text")).backgroundColor];
    await userEvent.keyboard("{/Space}");

    expect([hovered, ...pressed, getComputedStyle(button("text")).color])
      .toEqual([hover, true, hover, AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Dark, "text")]);
    expect(hover).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("shows a text button's keyboard focus as the accent outline inside its edge", async () => {
    render();

    button("primary").focus();
    await userEvent.tab();
    const style = getComputedStyle(button("text"));

    expect(document.activeElement).toBe(button("text"));
    expect([style.outlineStyle, style.outlineWidth, style.outlineOffset, style.outlineColor])
      .toEqual(["solid", "1px", "-1px", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent")]);
  });

  it("dims a disabled or aria-disabled text button to 0.4 with the default cursor and no hover fill, the aria-disabled one staying focusable", async () => {
    render();

    await userEvent.hover(page.getByTestId("text-locked"));
    button("text-locked").focus();
    const locked = getComputedStyle(button("text-locked"));
    const disabled = getComputedStyle(button("text-disabled"));

    expect([locked.opacity, locked.cursor, locked.backgroundColor]).toEqual(["0.4", "default", "rgba(0, 0, 0, 0)"]);
    expect([button("text-disabled").disabled, disabled.opacity, disabled.cursor, disabled.backgroundColor]).toEqual([true, "0.4", "default", "rgba(0, 0, 0, 0)"]);
    expect(document.activeElement).toBe(button("text-locked"));
  });
});
