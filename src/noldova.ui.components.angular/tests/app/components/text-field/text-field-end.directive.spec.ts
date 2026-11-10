/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { TextFieldBoxComponent } from "../../../../src/app/components/text-field/text-field-box.component";
import { TextFieldEndDirective } from "../../../../src/app/components/text-field/text-field-end.directive";
import { TextFieldComponent } from "../../../../src/app/components/text-field/text-field.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [TextFieldBoxComponent, TextFieldEndDirective, TextFieldComponent],
  template: `
    <nol-text-field-box class="named">
      <input nol-text-field aria-label="Name" aria-describedby="named-end" value="A name long enough to run on under the end text" />
      @if (isShown()) {
        <span id="named-end" nolTextFieldEnd>As Work</span>
      }
    </nol-text-field-box>
    <nol-text-field-box class="invalid">
      <input nol-text-field aria-label="Missing name" aria-invalid="true" value="A name long enough to run on under the end text" />
      <span nolTextFieldEnd>As Work</span>
    </nol-text-field-box>
    <nol-text-field-box class="long">
      <input nol-text-field aria-label="Long name" value="A name long enough to run on under the end text" />
      <span nolTextFieldEnd>Shown as "Work account for the whole team · Agent"</span>
    </nol-text-field-box>
    <nol-text-field-box class="glyph-long" icon="search" style="width: 14rem">
      <input nol-text-field aria-label="Search names" value="A name long enough to run on under the end text" />
      <span nolTextFieldEnd>Shown as "Work account for the whole team · Agent"</span>
    </nol-text-field-box>
    <nol-text-field-box class="glyph-long-invalid" icon="search" style="width: 14rem">
      <input nol-text-field aria-label="Missing search" aria-invalid="true" value="A name long enough to run on under the end text" />
      <span nolTextFieldEnd>Shown as "Work account for the whole team · Agent"</span>
    </nol-text-field-box>
    <nol-text-field-box class="locked">
      <input nol-text-field aria-label="Locked name" value="Locked" disabled />
      <span nolTextFieldEnd>As Work</span>
    </nol-text-field-box>
    <nol-text-field-box class="mirrored" dir="rtl">
      <input nol-text-field aria-label="Mirrored name" value="A name long enough to run on under the end text" />
      <span nolTextFieldEnd>As Work</span>
    </nol-text-field-box>
  `
})
class TextFieldEndHostComponent {
  public readonly isShown = signal(true);
}

interface Placement {
  field: DOMRect;
  end: DOMRect;
  border: number;
  textStart: number;
  textEnd: number;
}

describe("TextFieldEndDirective", () => {
  let fixture: ComponentFixture<TextFieldEndHostComponent>;

  const element = (selector: string): HTMLElement => DomFixture.one(DomFixture.host(fixture), selector);
  const box = (name: string): HTMLElement => element(`.${name}`);
  const input = (name: string): HTMLElement => element(`.${name} > input`);
  const end = (name: string): HTMLElement => element(`.${name} > .nol-text-field-end`);
  const measured = (name: string): string => getComputedStyle(box(name)).getPropertyValue("--nol-text-field-end-width");

  async function renderAsync(theme = DefaultTheme.theme, mode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(TextFieldEndHostComponent);
    fixture.detectChanges();
    await vi.waitFor(() => {
      for (const name of ["named", "invalid", "long", "glyph-long", "glyph-long-invalid", "locked", "mirrored"])
        AppearanceFixture.expectPixels(Number.parseFloat(measured(name)), end(name).getBoundingClientRect().width);
    });
  }

  function place(name: string): Placement {
    const style = getComputedStyle(input(name));
    const field = input(name).getBoundingClientRect();
    const border = parseFloat(style.borderRightWidth);
    return {
      field, end: end(name).getBoundingClientRect(), border,
      textStart: field.left + border + parseFloat(style.paddingLeft), textEnd: field.right - border - parseFloat(style.paddingRight)
    };
  }

  function expectInside(at: Placement): void {
    AppearanceFixture.expectPixels(at.field.right - at.border - at.end.right, AppearanceFixture.measureLook("field-padding"));
    AppearanceFixture.expectPixels(at.end.left - at.textEnd, AppearanceFixture.measureLook("space-2"));
    AppearanceFixture.expectPixels(at.end.top - at.field.top, at.field.bottom - at.end.bottom);
  }

  afterEach(() => AppearanceFixture.reset());

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shows muted text inside the field's border at its end, centred, the typed text stopping the theme's small spacing before it, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const at = place("named");
        const style = getComputedStyle(end("named"));

        AppearanceFixture.expectPixels(at.field.width, AppearanceFixture.measureLook("text-field-width"));
        AppearanceFixture.expectPixels(at.field.height, AppearanceFixture.measureLook("field-height"));
        expectInside(at);
        expect([style.color, style.fontSize, style.lineHeight, end("named").scrollWidth]).toEqual([
          AppearanceFixture.readColor(theme, mode, "text-muted"), getComputedStyle(input("named")).fontSize, getComputedStyle(input("named")).lineHeight,
          end("named").clientWidth
        ]);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`cuts a long end text with an ellipsis before the typed text's room falls below four rem, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const at = place("long");

        AppearanceFixture.expectTruncates(end("long"));
        AppearanceFixture.expectPixels(at.textEnd - at.textStart, AppearanceFixture.toPixels(4));
        expectInside(at);
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`keeps four rem for the typed text in a narrow field with a glyph at its start and a long end text, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const at = place("glyph-long");
        const glyph = element(".glyph-long > .nol-text-field-start").getBoundingClientRect();

        AppearanceFixture.expectTruncates(end("glyph-long"));
        AppearanceFixture.expectPixels(at.textEnd - at.textStart, AppearanceFixture.toPixels(4));
        AppearanceFixture.expectPixels(at.textStart - glyph.right, AppearanceFixture.measureLook("space-2"));
        expectInside(at);
      });

  it("keeps four rem for the typed text in a narrow field with a glyph and a long end text under forced colors, valid and invalid", async () => {
    await renderAsync();
    await ForcedColorsFixture.activateAsync();
    try {
      for (const name of ["glyph-long", "glyph-long-invalid"]) {
        const at = place(name);

        AppearanceFixture.expectTruncates(end(name));
        AppearanceFixture.expectPixels(at.textEnd - at.textStart, AppearanceFixture.toPixels(4));
        AppearanceFixture.expectPixels(at.end.left - at.textEnd, AppearanceFixture.measureLook("space-2"));
      }
      AppearanceFixture.expectPixels(place("glyph-long-invalid").border, AppearanceFixture.measureLook("border-width") * 2);
    } finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("keeps the end text's place and the typed text's end under forced colors, an invalid field's wider border taking from its padding", async () => {
    await renderAsync();
    const off = { named: place("named"), invalid: place("invalid") };
    await ForcedColorsFixture.activateAsync();
    try {
      const on = { named: place("named"), invalid: place("invalid") };

      for (const name of ["named", "invalid"] as const) {
        AppearanceFixture.expectPixels(on[name].end.right, off[name].end.right);
        AppearanceFixture.expectPixels(on[name].textEnd, off[name].textEnd);
      }
      AppearanceFixture.expectPixels(on.invalid.border, AppearanceFixture.measureLook("border-width") * 2);
      AppearanceFixture.expectPixels(on.invalid.end.left - on.invalid.textEnd, AppearanceFixture.measureLook("space-2"));
    } finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("dims a disabled field's end text with it, and draws it in GrayText under forced colors", async () => {
    await renderAsync();
    expect(getComputedStyle(end("locked")).opacity).toBe("0.5");
    await ForcedColorsFixture.activateAsync();
    try {
      expect(getComputedStyle(end("locked")).color).toBe(ForcedColorsFixture.resolve("GrayText"));
    } finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("puts the end text at the field's end on the left in a right-to-left layout, the typed text stopping the theme's small spacing before it", async () => {
    await renderAsync();
    const style = getComputedStyle(input("mirrored"));
    const field = input("mirrored").getBoundingClientRect();
    const text = end("mirrored").getBoundingClientRect();
    const border = parseFloat(style.borderLeftWidth);

    AppearanceFixture.expectPixels(text.left - field.left - border, AppearanceFixture.measureLook("field-padding"));
    AppearanceFixture.expectPixels(field.left + border + parseFloat(style.paddingLeft) - text.right, AppearanceFixture.measureLook("space-2"));
    AppearanceFixture.expectPixels(parseFloat(style.paddingRight), AppearanceFixture.measureLook("field-padding"));
  });

  it("lets a pointer on the end text reach the input, left to right and right to left", async () => {
    await renderAsync();
    for (const name of ["named", "mirrored"]) {
      const text = end(name).getBoundingClientRect();

      expect(document.elementFromPoint(text.left + text.width / 2, text.top + text.height / 2)).toBe(input(name));
    }
  });

  it("is read as the field's description when the field names it, and leaves the plain box when it goes", async () => {
    await renderAsync();
    expect(document.getElementById(input("named").getAttribute("aria-describedby") ?? "")?.textContent).toBe("As Work");

    fixture.componentInstance.isShown.set(false);
    fixture.detectChanges();
    await vi.waitFor(() => expect(measured("named")).toBe(""));

    const target = AppearanceFixture.measureLook("icon-button-target");
    const inset = Math.max(0, (AppearanceFixture.measureLook("field-height") - AppearanceFixture.measureLook("border-width") * 2 - target) / 2);
    AppearanceFixture.expectPixels(parseFloat(getComputedStyle(input("named")).paddingRight), AppearanceFixture.measureLook("field-padding") + target + inset);
    expect(getComputedStyle(box("named")).containerType).toBe("normal");
  });
});
