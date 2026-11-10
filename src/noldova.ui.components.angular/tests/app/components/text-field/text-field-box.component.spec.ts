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
import { TextFieldBoxComponent } from "../../../../src/app/components/text-field/text-field-box.component";
import { TextFieldComponent } from "../../../../src/app/components/text-field/text-field.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [IconButtonComponent, TextFieldBoxComponent, TextFieldComponent],
  template: `
    <input class="before" nol-text-field aria-label="Name" />
    <nol-text-field-box class="folder">
      <input nol-text-field aria-label="Profile folder" value="A profile folder whose path runs on past the end of the field and under its button" />
      <button type="button" nol-icon-button icon="folder_open" label="Choose folder"></button>
    </nol-text-field-box>
    <nol-text-field-box class="invalid">
      <input nol-text-field aria-label="Missing folder" aria-invalid="true" />
      <button type="button" nol-icon-button icon="folder_open" label="Choose missing folder"></button>
    </nol-text-field-box>
    <nol-text-field-box class="locked">
      <input nol-text-field aria-label="Locked folder" value="Locked" disabled />
      <button type="button" nol-icon-button icon="folder_open" label="Choose locked folder" disabled></button>
    </nol-text-field-box>
    <nol-text-field-box class="mirrored" dir="rtl">
      <input nol-text-field aria-label="Mirrored folder" />
      <button type="button" nol-icon-button icon="folder_open" label="Choose mirrored folder"></button>
    </nol-text-field-box>
    <div class="narrow" style="width: 8rem">
      <nol-text-field-box class="tight">
        <input nol-text-field aria-label="Narrow folder" value="A folder path longer than this narrow box" />
        <button type="button" nol-icon-button icon="folder_open" label="Choose narrow folder"></button>
      </nol-text-field-box>
    </div>
  `
})
class TextFieldBoxHostComponent {}

interface Placement {
  box: DOMRect;
  field: DOMRect;
  button: DOMRect;
  pill: DOMRect;
  border: number;
  textEnd: number;
}

describe("TextFieldBoxComponent", () => {
  let fixture: ComponentFixture<TextFieldBoxHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(TextFieldBoxHostComponent);
    fixture.detectChanges();
  }

  const element = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const box = (name: string): HTMLElement => element(`.${name}`);
  const before = (): HTMLElement => element(".before");
  const input = (name: string): HTMLElement => element(`.${name} > input`);
  const button = (name: string): HTMLElement => element(`.${name} > button`);

  function place(name: string): Placement {
    const style = getComputedStyle(input(name));
    const pill = getComputedStyle(button(name), "::before");
    const target = button(name).getBoundingClientRect();
    const width = parseFloat(pill.width);
    const height = parseFloat(pill.height);
    const field = input(name).getBoundingClientRect();
    const border = parseFloat(style.borderRightWidth);
    return {
      box: box(name).getBoundingClientRect(), field, button: target,
      pill: new DOMRect(target.left + (target.width - width) / 2, target.top + (target.height - height) / 2, width, height),
      border, textEnd: field.right - border - parseFloat(style.paddingRight)
    };
  }

  function expectInside(at: Placement): void {
    const target = AppearanceFixture.measureLook("icon-button-target");
    const inset = Math.max(0, (AppearanceFixture.measureLook("field-height") - AppearanceFixture.measureLook("border-width") * 2 - target) / 2);
    AppearanceFixture.expectPixels(at.button.width, target);
    AppearanceFixture.expectPixels(at.field.right - at.border - at.button.right, inset);
    AppearanceFixture.expectPixels(at.button.top - at.field.top, at.field.bottom - at.button.bottom);
    AppearanceFixture.expectPixels(at.button.left - at.textEnd, AppearanceFixture.measureLook("field-padding"));
  }

  afterEach(() => AppearanceFixture.reset());

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`fills the field's width and height with the input and keeps the button inside its border at its end, centred, its fill as far from the end as from the top, the text stopping the field padding before it, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const at = place("folder");
        const plain = before().getBoundingClientRect();

        AppearanceFixture.expectPixels(at.box.width, AppearanceFixture.measureLook("text-field-width"));
        expect([at.field.left, at.field.right, at.field.top, at.field.bottom]).toEqual([at.box.left, at.box.right, at.box.top, at.box.bottom]);
        AppearanceFixture.expectPixels(at.field.height, AppearanceFixture.measureLook("field-height"));
        AppearanceFixture.expectPixels(at.field.width, plain.width);
        AppearanceFixture.expectPixels(at.field.height, plain.height);
        expectInside(at);
        AppearanceFixture.expectPixels(at.field.right - at.border - at.pill.right, at.pill.top - at.field.top - at.border);
        expect([at.pill.left > at.textEnd, at.pill.top > at.field.top + at.border, at.pill.bottom < at.field.bottom - at.border]).toEqual([true, true, true]);
        expect([getComputedStyle(input("folder")).borderTopColor, getComputedStyle(input("folder")).backgroundColor]).toEqual([
          AppearanceFixture.readColor(theme, mode, "input-border"), AppearanceFixture.readColor(theme, mode, "input")
        ]);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps the field's size, the button's place and its fill's gaps to the border and the text under forced colors, an invalid field's wider border shrinking the fill by its extra width on each side, in the ${theme.id} theme in ${mode} mode`, async () => {
        render(theme, mode);
        const gaps = (at: Placement): number[] => [at.pill.top - at.field.top - at.border, at.field.bottom - at.border - at.pill.bottom, at.field.right - at.border - at.pill.right,
          at.pill.left - at.textEnd];
        const off = { folder: place("folder"), invalid: place("invalid") };
        await ForcedColorsFixture.activateAsync();
        try {
          const width = AppearanceFixture.measureLook("border-width");
          const on = { folder: place("folder"), invalid: place("invalid") };
          const expectKept = (was: Placement, at: Placement): void => {
            for (const [index, gap] of gaps(at).entries())
              AppearanceFixture.expectPixels(gap, DomFixture.at(gaps(off.folder), index));
            AppearanceFixture.expectPixels(at.field.width, was.field.width);
            AppearanceFixture.expectPixels(at.field.height, was.field.height);
            AppearanceFixture.expectPixels(at.button.left, was.button.left);
            AppearanceFixture.expectPixels(at.button.top, was.button.top);
          };

          expect([on.folder.border, on.invalid.border, getComputedStyle(input("invalid")).borderTopStyle]).toEqual([width, width * 2, "dashed"]);
          expect(gaps(off.folder).every(t => t > 0)).toBe(true);
          AppearanceFixture.expectPixels(on.invalid.pill.width, off.invalid.pill.width - width * 2);
          expectKept(off.folder, on.folder);
          expectKept(off.invalid, on.invalid);
        }
        finally {
          await ForcedColorsFixture.resetAsync();
        }
      });

  it("reaches the button by keyboard after the input, and shows the field's focus border while the button has focus, keeping an invalid field's error border", async () => {
    render();
    const accent = AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent");
    const border = AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "input-border");
    const resting = getComputedStyle(input("folder")).borderTopColor;

    input("folder").focus();
    await userEvent.tab();
    const order = document.activeElement === button("folder");
    const focused = getComputedStyle(input("folder")).borderTopColor;
    await userEvent.tab();
    await userEvent.tab();
    const invalid = [document.activeElement === button("invalid"), getComputedStyle(input("invalid")).borderTopColor];

    expect([resting, order, focused]).toEqual([border, true, accent]);
    expect(invalid).toEqual([true, AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "error")]);
  });

  it("draws the field's focus outline in Highlight under forced colors while the button has keyboard focus", async () => {
    render();
    await ForcedColorsFixture.activateAsync();
    try {
      const unfocused = getComputedStyle(input("folder")).outlineStyle;
      input("folder").focus();
      await userEvent.tab();
      const style = getComputedStyle(input("folder"));

      expect([unfocused, document.activeElement === button("folder"), style.outlineStyle, style.outlineColor, parseFloat(style.outlineWidth)]).toEqual([
        "none", true, "solid", ForcedColorsFixture.resolve("Highlight"), AppearanceFixture.measureLook("border-width") * 2
      ]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("dims a disabled field and its disabled button alike, and draws both in GrayText under forced colors", async () => {
    render();
    const looks = [getComputedStyle(input("locked")).opacity, getComputedStyle(button("locked")).opacity];
    await ForcedColorsFixture.activateAsync();
    try {
      const gray = ForcedColorsFixture.resolve("GrayText");

      expect(looks).toEqual(["0.5", "0.5"]);
      expect([getComputedStyle(input("locked")).borderTopColor, getComputedStyle(input("locked")).color, getComputedStyle(button("locked")).color]).toEqual([gray, gray, gray]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`narrows to a parent narrower than the field, the input filling it and the button keeping its place and its gap to the text, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const parent = element(".narrow").getBoundingClientRect();
        const at = place("tight");

        expect(parent.width < AppearanceFixture.measureLook("text-field-width")).toBe(true);
        AppearanceFixture.expectPixels(at.box.width, parent.width);
        AppearanceFixture.expectPixels(at.field.width, parent.width);
        expect([at.field.left, at.field.right]).toEqual([parent.left, parent.right]);
        expectInside(at);
      });

  it("puts the button at the field's end on the left in a right-to-left layout, the text stopping the field padding before it", () => {
    render();
    const field = input("mirrored").getBoundingClientRect();
    const target = button("mirrored").getBoundingClientRect();
    const style = getComputedStyle(input("mirrored"));
    const border = parseFloat(style.borderLeftWidth);

    AppearanceFixture.expectPixels(target.left - field.left - border, 0);
    AppearanceFixture.expectPixels(field.left + border + parseFloat(style.paddingLeft) - target.right, AppearanceFixture.measureLook("field-padding"));
    AppearanceFixture.expectPixels(parseFloat(style.paddingRight), AppearanceFixture.measureLook("field-padding"));
  });
});
