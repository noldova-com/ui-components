/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

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
    <nol-text-field-box class="search" [icon]="icon()">
      <input nol-text-field aria-label="Search conversations" value="A search whose words run on past the end of the field" />
    </nol-text-field-box>
    <nol-text-field-box class="invalid" icon="search">
      <input nol-text-field aria-label="Missing search" aria-invalid="true" />
    </nol-text-field-box>
    <nol-text-field-box class="locked" icon="search">
      <input nol-text-field aria-label="Locked search" value="Locked" disabled />
    </nol-text-field-box>
    <nol-text-field-box class="mirrored" icon="search" dir="rtl">
      <input nol-text-field aria-label="Mirrored search" />
    </nol-text-field-box>
    <nol-text-field-box class="both" icon="folder">
      <input nol-text-field aria-label="Profile folder" />
      <button type="button" nol-icon-button icon="folder_open" label="Choose folder"></button>
    </nol-text-field-box>
  `
})
class TextFieldBoxIconHostComponent {
  public readonly icon = signal<string | null>("search");
}

interface Placement {
  field: DOMRect;
  glyph: DOMRect;
  border: number;
  textStart: number;
  textEnd: number;
}

describe("TextFieldBoxComponent's leading icon", () => {
  let fixture: ComponentFixture<TextFieldBoxIconHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(TextFieldBoxIconHostComponent);
    fixture.detectChanges();
  }

  const element = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const input = (name: string): HTMLElement => element(`.${name} > input`);
  const glyph = (name: string): HTMLElement => element(`.${name} > .nol-text-field-start`);
  const glyphs = (name: string): number => DomFixture.host(fixture).querySelectorAll(`.${name} > .nol-text-field-start`).length;

  function place(name: string): Placement {
    const style = getComputedStyle(input(name));
    const field = input(name).getBoundingClientRect();
    const border = parseFloat(style.borderLeftWidth);
    return {
      field, glyph: glyph(name).getBoundingClientRect(), border,
      textStart: field.left + border + parseFloat(style.paddingLeft), textEnd: field.right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight)
    };
  }

  afterEach(() => AppearanceFixture.reset());

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`draws the glyph inside the field's border at its start, 1rem square and centred, in the muted text colour, the field padding from the border, the text starting the space-2 step after it and running to the field padding at its end, the field keeping its size, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const at = place("search");
        const plain = element(".before").getBoundingClientRect();
        const padding = AppearanceFixture.measureLook("field-padding");

        AppearanceFixture.expectPixels(at.field.width, plain.width);
        AppearanceFixture.expectPixels(at.field.height, AppearanceFixture.measureLook("field-height"));
        AppearanceFixture.expectPixels(at.glyph.width, AppearanceFixture.measureLook("icon"));
        AppearanceFixture.expectPixels(at.glyph.height, AppearanceFixture.measureLook("icon"));
        AppearanceFixture.expectPixels(at.glyph.left - at.field.left - at.border, padding);
        AppearanceFixture.expectPixels(at.glyph.top - at.field.top, at.field.bottom - at.glyph.bottom);
        AppearanceFixture.expectPixels(at.textStart - at.glyph.right, AppearanceFixture.measureLook("space-2"));
        AppearanceFixture.expectPixels(at.field.right - at.border - at.textEnd, padding);
        expect([glyph("search").textContent?.trim(), getComputedStyle(glyph("search")).color]).toEqual(["search", AppearanceFixture.readColor(theme, mode, "text-muted")]);
      });

  it("hides the glyph from assistive technology and lets a click on it reach the input, which keeps its own name", () => {
    render();

    expect([glyph("search").getAttribute("aria-hidden"), getComputedStyle(glyph("search")).pointerEvents, input("search").getAttribute("aria-label")]).toEqual([
      "true", "none", "Search conversations"
    ]);
  });

  it("draws no glyph, and starts the text the field padding from the border, while the icon is null or empty", () => {
    render();
    const padding = AppearanceFixture.measureLook("field-padding");
    fixture.componentInstance.icon.set(null);
    fixture.detectChanges();
    const none = [glyphs("search"), parseFloat(getComputedStyle(input("search")).paddingLeft)];
    fixture.componentInstance.icon.set("");
    fixture.detectChanges();

    expect(none[0]).toBe(0);
    AppearanceFixture.expectPixels(DomFixture.at(none, 1), padding);
    expect(glyphs("search")).toBe(0);
    AppearanceFixture.expectPixels(parseFloat(getComputedStyle(input("search")).paddingLeft), padding);
  });

  it("holds the glyph at the start and an icon button at the end of the same field, the text between them", () => {
    render();
    const at = place("both");
    const target = element(".both > button").getBoundingClientRect();

    AppearanceFixture.expectPixels(at.glyph.left - at.field.left - at.border, AppearanceFixture.measureLook("field-padding"));
    AppearanceFixture.expectPixels(at.textStart - at.glyph.right, AppearanceFixture.measureLook("space-2"));
    AppearanceFixture.expectPixels(target.left - at.textEnd, AppearanceFixture.measureLook("field-padding"));
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps the glyph and the text's start where they are under forced colors, an invalid field's wider border taking from its padding, in the ${theme.id} theme in ${mode} mode`, async () => {
        render(theme, mode);
        const off = { search: place("search"), invalid: place("invalid") };
        await ForcedColorsFixture.activateAsync();
        try {
          const width = AppearanceFixture.measureLook("border-width");
          const on = { search: place("search"), invalid: place("invalid") };

          expect([on.search.border, on.invalid.border, getComputedStyle(input("invalid")).borderTopStyle]).toEqual([width, width * 2, "dashed"]);
          for (const [was, at] of [[off.search, on.search], [off.invalid, on.invalid]] as const) {
            AppearanceFixture.expectPixels(at.glyph.left, was.glyph.left);
            AppearanceFixture.expectPixels(at.glyph.top, was.glyph.top);
            AppearanceFixture.expectPixels(at.textStart, was.textStart);
            AppearanceFixture.expectPixels(at.textEnd, was.textEnd);
            AppearanceFixture.expectPixels(at.field.width, was.field.width);
            AppearanceFixture.expectPixels(at.field.height, was.field.height);
          }
          AppearanceFixture.expectPixels(on.invalid.textStart - on.invalid.field.left, on.search.textStart - on.search.field.left);
          AppearanceFixture.expectPixels(on.invalid.glyph.left - on.invalid.field.left, on.search.glyph.left - on.search.field.left);
        }
        finally {
          await ForcedColorsFixture.resetAsync();
        }
      });

  it("dims a disabled field's glyph with it, and draws it in GrayText under forced colors", async () => {
    render();
    const opacity = getComputedStyle(glyph("locked")).opacity;
    await ForcedColorsFixture.activateAsync();
    try {
      expect([opacity, getComputedStyle(glyph("locked")).color]).toEqual(["0.5", ForcedColorsFixture.resolve("GrayText")]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("puts the glyph at the field's start on the right in a right-to-left layout, the text starting the space-2 step before it and running to the field padding at the left", () => {
    render();
    const field = input("mirrored").getBoundingClientRect();
    const mark = glyph("mirrored").getBoundingClientRect();
    const style = getComputedStyle(input("mirrored"));
    const border = parseFloat(style.borderRightWidth);

    AppearanceFixture.expectPixels(field.right - border - mark.right, AppearanceFixture.measureLook("field-padding"));
    AppearanceFixture.expectPixels(mark.left - (field.right - border - parseFloat(style.paddingRight)), AppearanceFixture.measureLook("space-2"));
    AppearanceFixture.expectPixels(parseFloat(style.paddingLeft), AppearanceFixture.measureLook("field-padding"));
  });
});
