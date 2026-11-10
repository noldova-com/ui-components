/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { TextFieldComponent } from "../../../../src/app/components/text-field/text-field.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { ComponentStyleFixture } from "../../../fixtures/component-style.fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [TextFieldComponent],
  template: `
    <input class="search" nol-text-field type="search" aria-label="Search settings" placeholder="Search settings" />
    <input class="size" nol-text-field type="number" aria-label="Panel size" min="12" max="18" disabled />
    <input class="name" nol-text-field aria-label="Name" value="Ada" disabled />
    <input class="ratio" nol-text-field type="number" aria-label="Ratio" aria-invalid="true" />
    <textarea class="role" nol-text-field rows="4" aria-label="Role" placeholder="What this teammate does"></textarea>
    <textarea class="brief" nol-text-field rows="4" aria-label="Brief" disabled></textarea>
    <textarea class="notes" nol-text-field rows="4" aria-label="Notes" aria-invalid="true"></textarea>
  `
})
class TextFieldHostComponent {}

describe("TextFieldComponent", () => {
  let fixture: ComponentFixture<TextFieldHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(TextFieldHostComponent);
    fixture.detectChanges();
  }

  const field = (name: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), `.${name}`);

  afterEach(() => AppearanceFixture.reset());

  it("keeps the native input, takes the accent border while focused and dims while disabled", () => {
    render();

    field("search").focus();

    expect(field("search").classList.contains("nol-text-field")).toBe(true);
    expect(getComputedStyle(field("search")).borderTopColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent"));
    expect([getComputedStyle(field("size")).opacity, getComputedStyle(field("size")).cursor]).toEqual(["0.5", "default"]);
  });

  for (const panelSize of AppearanceFixture.panelSizes)
    it(`writes its text in the panel text role at panel size ${panelSize}, on one line or several`, () => {
      AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light, panelSize);
      fixture = TestBed.createComponent(TextFieldHostComponent);
      fixture.detectChanges();

      for (const name of ["search", "role"]) {
        const style = getComputedStyle(field(name));
        AppearanceFixture.expectRem(style.fontSize, 0.8125, panelSize);
        AppearanceFixture.expectRem(style.lineHeight, 1.125, panelSize);
      }
    });

  it("keeps the error border while invalid, focused or not", () => {
    render();
    const error = AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "error");
    const unfocused = getComputedStyle(field("ratio")).borderTopColor;

    field("ratio").focus();

    expect([unfocused, getComputedStyle(field("ratio")).borderTopColor]).toEqual([error, error]);
  });

  it("draws a disabled field's border and text in GrayText under forced colors, and an enabled field's in FieldText", async () => {
    render();
    await ForcedColorsFixture.activateAsync();
    try {
      const ink = (name: string): string[] => [getComputedStyle(field(name)).borderTopColor, getComputedStyle(field(name)).color];
      const text = ForcedColorsFixture.resolve("FieldText");
      const gray = ForcedColorsFixture.resolve("GrayText");

      expect([ink("search"), ink("role"), ink("name"), ink("size"), ink("brief")]).toEqual([[text, text], [text, text], [gray, gray], [gray, gray], [gray, gray]]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps a cue in system colors while invalid under forced colors, a dashed CanvasText border twice as wide, with its size and text where they were, beside the focus outline, in the ${theme.id} theme in ${mode} mode`, async () => {
        render(theme, mode);
        const measure = (name: string): { look: (string | number)[]; color: string; size: number[]; inset: number } => {
          const style = getComputedStyle(field(name));
          const box = field(name).getBoundingClientRect();
          return { look: [style.borderTopStyle, parseFloat(style.borderTopWidth), style.outlineStyle], color: style.borderTopColor, size: [box.width, box.height],
            inset: parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft) };
        };
        const off = measure("ratio");
        await ForcedColorsFixture.activateAsync();
        try {
          const width = AppearanceFixture.measureLook("border-width");
          const valid = measure("search");
          const invalid = measure("ratio");
          field("ratio").focus();
          const focused = measure("ratio");
          const outline = getComputedStyle(field("ratio"));
          const text = ForcedColorsFixture.resolve("CanvasText");

          expect([valid.look, invalid.look, focused.look]).toEqual([["solid", width, "none"], ["dashed", width * 2, "none"], ["dashed", width * 2, "solid"]]);
          expect([invalid.color, focused.color, outline.outlineColor, parseFloat(outline.outlineWidth)]).toEqual([text, text, ForcedColorsFixture.resolve("Highlight"), width * 2]);
          for (const state of [invalid, focused]) {
            AppearanceFixture.expectPixels(state.inset, off.inset);
            AppearanceFixture.expectPixels(state.size[0] as number, off.size[0] as number);
            AppearanceFixture.expectPixels(state.size[1] as number, off.size[1] as number);
          }
        }
        finally {
          await ForcedColorsFixture.resetAsync();
        }
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its colors and geometry from the ${theme.id} theme in ${mode} mode, the field height with no padding above or below its line`, () => {
        render(theme, mode);
        const style = getComputedStyle(field("search"));

        expect(style.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "input"));
        expect(style.borderTopColor).toBe(AppearanceFixture.readColor(theme, mode, "input-border"));
        expect(style.color).toBe(AppearanceFixture.readColor(theme, mode, "input-text"));
        expect(getComputedStyle(field("search"), "::placeholder").color).toBe(AppearanceFixture.readColor(theme, mode, "placeholder"));
        AppearanceFixture.expectLook(style.minHeight, theme, "field-height", "min-height");
        AppearanceFixture.expectLook(style.paddingLeft, theme, "field-padding", "padding-left");
        AppearanceFixture.expectLook(style.width, theme, "text-field-width", "width");
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        expect([parseFloat(style.paddingTop), parseFloat(style.paddingBottom)]).toEqual([0, 0]);
        AppearanceFixture.expectPixels(field("search").getBoundingClientRect().height, AppearanceFixture.measureLook("field-height"));
      });

  it("styles a native textarea as the same field: the accent border while focused, the error border while invalid, focused or not, and dimmed while disabled", () => {
    render();
    const error = AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "error");
    const invalid = getComputedStyle(field("notes")).borderTopColor;

    field("role").focus();
    const focused = getComputedStyle(field("role")).borderTopColor;
    field("notes").focus();

    expect([field("role").tagName, field("role").classList.contains("nol-text-field"), focused]).toEqual(["TEXTAREA", true, AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent")]);
    expect([invalid, getComputedStyle(field("notes")).borderTopColor]).toEqual([error, error]);
    expect([getComputedStyle(field("brief")).opacity, getComputedStyle(field("brief")).cursor]).toEqual(["0.5", "default"]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its colors and geometry on several lines from the ${theme.id} theme in ${mode} mode, at least the field height, with the field padding on every side, resized only up and down, aligned to the top of its line`, () => {
        render(theme, mode);
        const style = getComputedStyle(field("role"));
        const box = field("role").getBoundingClientRect();
        const padding = AppearanceFixture.measureLook("field-padding");
        const border = AppearanceFixture.measureLook("border-width");

        expect([style.backgroundColor, style.borderTopColor, style.color, getComputedStyle(field("role"), "::placeholder").color]).toEqual([
          AppearanceFixture.readColor(theme, mode, "input"), AppearanceFixture.readColor(theme, mode, "input-border"), AppearanceFixture.readColor(theme, mode, "input-text"),
          AppearanceFixture.readColor(theme, mode, "placeholder")
        ]);
        for (const side of [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft])
          AppearanceFixture.expectPixels(parseFloat(side), padding);
        AppearanceFixture.expectLook(style.minHeight, theme, "field-height", "min-height");
        AppearanceFixture.expectLook(style.width, theme, "text-field-width", "width");
        AppearanceFixture.expectLook(style.borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        AppearanceFixture.expectPixels(box.height, parseFloat(style.lineHeight) * 4 + padding * 2 + border * 2);
        expect([box.height >= AppearanceFixture.measureLook("field-height"), style.resize, style.verticalAlign]).toEqual([true, "vertical", "top"]);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps the forced-colors looks on several lines, a solid border while valid, the focus outline in Highlight while focused, and the invalid cue with its size and text where they were, in the ${theme.id} theme in ${mode} mode`, async () => {
        render(theme, mode);
        const measure = (): { look: (string | number)[]; size: number[]; inset: number[] } => {
          const style = getComputedStyle(field("notes"));
          const box = field("notes").getBoundingClientRect();
          return { look: [style.borderTopStyle, parseFloat(style.borderTopWidth)], size: [box.width, box.height],
            inset: [parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft), parseFloat(style.borderTopWidth) + parseFloat(style.paddingTop)] };
        };
        const off = measure();
        await ForcedColorsFixture.activateAsync();
        try {
          const width = AppearanceFixture.measureLook("border-width");
          const invalid = measure();
          const valid = getComputedStyle(field("role"));
          const look = [valid.borderTopStyle, parseFloat(valid.borderTopWidth), valid.borderTopColor, valid.outlineStyle];
          field("role").focus();
          const focused = getComputedStyle(field("role"));

          expect(invalid.look).toEqual(["dashed", width * 2]);
          expect(look).toEqual(["solid", width, ForcedColorsFixture.resolve("CanvasText"), "none"]);
          expect([focused.outlineStyle, focused.outlineColor, parseFloat(focused.outlineWidth)]).toEqual(["solid", ForcedColorsFixture.resolve("Highlight"), width * 2]);
          for (const [index, value] of [...invalid.size, ...invalid.inset].entries())
            AppearanceFixture.expectPixels(value, [...off.size, ...off.inset][index] as number);
        }
        finally {
          await ForcedColorsFixture.resetAsync();
        }
      });

  it("keeps the margin a single-class rule outside gives it, whatever order the page loaded the stylesheets in", () => {
    render();
    const element = field("size");
    const left = element.getBoundingClientRect().left;
    ComponentStyleFixture.addBefore(element, ".size { margin-inline-start: 12px; }");

    AppearanceFixture.expectPixels(element.getBoundingClientRect().left - left, 12);
    expect(ComponentStyleFixture.of(element).textContent).toMatch(/:where\(\[_nghost-[\w-]+\]\) \{\s*margin: 0;\s*\}/);
  });
});
