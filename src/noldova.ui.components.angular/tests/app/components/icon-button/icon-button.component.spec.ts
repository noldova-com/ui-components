/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Component, signal } from "@angular/core";
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
    <button type="button" nol-icon-button icon="more_horiz" label="More actions" [pressed]="pressed()" [busy]="busy()" [disabled]="disabled()" (click)="presses = presses + 1">
    </button>
  `
})
class IconButtonHostComponent {
  public readonly pressed = signal<boolean | undefined>(undefined);
  public readonly busy = signal(false);
  public readonly disabled = signal(false);
  public presses: number = 0;
}

describe("IconButtonComponent", () => {
  let fixture: ComponentFixture<IconButtonHostComponent>;

  beforeEach(() => {
    AppearanceFixture.apply();
    fixture = TestBed.createComponent(IconButtonHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => AppearanceFixture.reset());

  function button(): HTMLButtonElement {
    return DomFixture.oneOf(DomFixture.host(fixture), "button", HTMLButtonElement);
  }

  function pad(): CSSStyleDeclaration {
    return getComputedStyle(button(), "::before");
  }

  it("is a native button named by its label, with its glyph hidden from assistive technology", () => {
    button().click();

    expect(fixture.componentInstance.presses).toBe(1);
    expect(button().getAttribute("aria-label")).toBe("More actions");
    expect(button().hasAttribute("aria-pressed")).toBe(false);
    expect(button().querySelector(".nol-icon-button-glyph")?.textContent).toBe("more_horiz");
    expect(button().querySelector(".nol-icon-button-glyph")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("exposes its pressed state and shows it with the hover fill", () => {
    fixture.componentInstance.pressed.set(true);
    fixture.detectChanges();

    expect(button().getAttribute("aria-pressed")).toBe("true");
    expect(pad().backgroundColor).toBe("rgba(184, 184, 184, 0.314)");

    fixture.componentInstance.pressed.set(false);
    fixture.detectChanges();

    expect(button().getAttribute("aria-pressed")).toBe("false");
    expect(pad().backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  it("shows the toolbar hover fill on hover but not when disabled", async () => {
    await userEvent.hover(button());

    expect(pad().backgroundColor).toBe("rgba(184, 184, 184, 0.314)");

    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    expect(pad().backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(button()).cursor).toBe("default");
  });

  it("draws its glyph in GrayText under forced colors while disabled or aria-disabled, and in ButtonText while available, staying focusable while aria-disabled", async () => {
    await ForcedColorsFixture.activateAsync();
    try {
      const ink = (): string[] => [...button().children].map(t => getComputedStyle(t).color);
      const available = ink();
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      const disabled = ink();
      fixture.componentInstance.disabled.set(false);
      fixture.detectChanges();
      button().setAttribute("aria-disabled", "true");
      button().focus();

      expect([available, disabled, ink(), document.activeElement === button()])
        .toEqual([[ForcedColorsFixture.resolve("ButtonText")], [ForcedColorsFixture.resolve("GrayText")], [ForcedColorsFixture.resolve("GrayText")], true]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("draws a pressed button that is disabled or aria-disabled in GrayText on Canvas inside a GrayText outline under forced colors, which the focus outline replaces", async () => {
    fixture.componentInstance.pressed.set(true);
    fixture.detectChanges();
    await ForcedColorsFixture.activateAsync();
    try {
      const look = (): string[] => [
        getComputedStyle(button()).color, ...[...button().children].map(t => getComputedStyle(t).color),
        pad().backgroundColor, pad().outlineStyle, pad().outlineWidth, pad().outlineColor, pad().outlineOffset
      ];
      const available = look();
      fixture.componentInstance.disabled.set(true);
      fixture.detectChanges();
      const disabled = look();
      fixture.componentInstance.disabled.set(false);
      fixture.detectChanges();
      button().setAttribute("aria-disabled", "true");
      const unavailable = look();
      await userEvent.keyboard("{Tab}");
      await vi.waitFor(() => expect(document.activeElement).toBe(button()));
      const [gray, canvas, highlight, border] = [
        ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("Canvas"), ForcedColorsFixture.resolve("Highlight"), AppearanceFixture.measureLook("border-width")
      ];
      const designed = [gray, gray, canvas, "solid", `${border}px`, gray, `${-border}px`];

      expect(available.slice(0, 3)).toEqual([ForcedColorsFixture.resolve("HighlightText"), ForcedColorsFixture.resolve("HighlightText"), highlight]);
      expect([disabled, unavailable]).toEqual([designed, designed]);
      expect(look()).toEqual([gray, gray, canvas, "solid", `${border * 2}px`, highlight, `${-border}px`]);
    }
    finally {
      await ForcedColorsFixture.resetAsync();
    }
  });

  it("looks disabled, without the hover fill, while marked aria-disabled, and stays focusable", async () => {
    button().setAttribute("aria-disabled", "true");
    await userEvent.hover(button());
    button().focus();
    const style = getComputedStyle(button());

    expect([style.opacity, style.cursor, pad().backgroundColor, document.activeElement === button()]).toEqual(["0.5", "default", "rgba(0, 0, 0, 0)", true]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its glyph color and geometry from the ${theme.id} theme in ${mode} mode`, () => {
        AppearanceFixture.apply(theme, mode);

        expect(getComputedStyle(button()).color).toBe(AppearanceFixture.readColor(theme, mode, "icon-color"));
        AppearanceFixture.expectLook(pad().width, theme, "icon-button", "width");
        AppearanceFixture.expectLook(pad().borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        AppearanceFixture.expectLook(getComputedStyle(button().querySelector(".nol-icon-button-glyph") ?? button()).fontSize, theme, "icon", "font-size");
      });

  for (const panelSize of AppearanceFixture.panelSizes)
    for (const isFontLoaded of [true, false])
      it(`keeps a pointer target of at least 24 pixels at panel size ${panelSize} ${isFontLoaded ? "with" : "before"} the symbols font`, () => {
        AppearanceFixture.apply(DefaultTheme.theme, ThemeMode.Light, panelSize);
        const glyph = button().querySelector<HTMLElement>(".nol-icon-button-glyph") ?? button();
        if (!isFontLoaded)
          glyph.style.fontFamily = "not-a-loaded-font";

        const bounds = button().getBoundingClientRect();
        const glyphBounds = glyph.getBoundingClientRect();

        AppearanceFixture.expectRem(pad().width, 1.375, panelSize);
        expect(bounds.width).toBeGreaterThanOrEqual(24);
        expect(bounds.height).toBeGreaterThanOrEqual(24);
        AppearanceFixture.expectPixels(bounds.width, Math.max(24, AppearanceFixture.toPixels(1.375, panelSize)));
        AppearanceFixture.expectPixels(glyphBounds.width, AppearanceFixture.toPixels(1, panelSize));
        AppearanceFixture.expectPixels(glyphBounds.height, AppearanceFixture.toPixels(1, panelSize));
      });

  for (const mode of AppearanceFixture.modes)
    it(`draws a busy pressed button's spinner arc in HighlightText on its Highlight fill, and in Highlight on Canvas once disabled, over its GrayText ring, under forced colors in ${mode} mode`, async () => {
      AppearanceFixture.apply(undefined, mode);
      fixture.componentInstance.pressed.set(true);
      fixture.componentInstance.busy.set(true);
      fixture.detectChanges();
      await ForcedColorsFixture.activateAsync();
      try {
        const look = (): string[] => {
          const ring = getComputedStyle(DomFixture.one(button(), ".nol-icon-button-spinner .nol-spinner-ring"));
          return [pad().backgroundColor, ring.borderTopColor, ring.borderBottomColor];
        };
        const pressed = look();
        fixture.componentInstance.disabled.set(true);
        fixture.detectChanges();
        const [highlight, text, gray, canvas] = ["Highlight", "HighlightText", "GrayText", "Canvas"].map(t => ForcedColorsFixture.resolve(t));

        expect([pressed, look()]).toEqual([[highlight, text, gray], [canvas, highlight, gray]]);
      }
      finally {
        await ForcedColorsFixture.resetAsync();
      }
    });
});
