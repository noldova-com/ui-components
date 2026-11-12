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

import { ButtonComponent } from "../../../../src/app/components/button/button.component";
import { ButtonVariant } from "../../../../src/app/enums/button-variant";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";
import { GalleryFixture } from "../../../fixtures/gallery.fixture";

@Component({
  imports: [ButtonComponent],
  template: `
    <button type="button" class="primary" nol-button [disabled]="disabled()" (click)="presses = presses + 1">Move aside</button>
    <button type="button" class="secondary" nol-button [variant]="secondary">Wait for it</button>
    <div style="width: 6rem"><button type="button" class="long" nol-button>A label far too long to fit the width its button is given</button></div>
    <div style="width: 6rem"><button type="button" class="unavailable" nol-button disabled>A label far too long to fit the width its button is given</button></div>
    <div style="width: 6rem"><button type="button" class="icon" nol-button><span nolButtonIcon class="glyph" style="width: 1rem">+</span>A label far too long to fit the width its button is given</button></div>
    <a class="link" nol-button href="#guide">Read the guide</a>
    <button type="button" class="locked" nol-button aria-disabled="true">Locked</button>
    <button type="button" class="text" nol-button [variant]="text">Restart</button>
    <button type="button" class="keep" nol-button>Delete</button>
    <button type="button" class="danger" nol-button [danger]="true">Delete</button>
    <button type="button" class="danger-off" nol-button [danger]="true" disabled>Delete</button>
    <button type="button" class="danger-locked" nol-button [danger]="true" aria-disabled="true">Delete</button>
    <button type="button" class="danger-secondary" nol-button [variant]="secondary" [danger]="true">Delete</button>
    <button type="button" class="danger-text" nol-button [variant]="text" [danger]="true">Delete</button>
  `
})
class ButtonHostComponent {
  protected readonly secondary: ButtonVariant = ButtonVariant.Secondary;
  protected readonly text: ButtonVariant = ButtonVariant.Text;
  public readonly disabled = signal(false);
  public presses: number = 0;
}

describe("ButtonComponent", () => {
  let fixture: ComponentFixture<ButtonHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light, panelSize?: number): void {
    AppearanceFixture.apply(theme, mode, panelSize);
    fixture = TestBed.createComponent(ButtonHostComponent);
    fixture.detectChanges();
  }

  function button(variant: string): HTMLButtonElement {
    return DomFixture.oneOf(DomFixture.host(fixture), `button.${variant}`, HTMLButtonElement);
  }

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  it("is a native button with its own text that responds unless disabled", async () => {
    render();

    button("primary").click();
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    button("primary").click();

    expect(fixture.componentInstance.presses).toBe(1);
    expect(button("primary").textContent).toBe("Move aside");
    expect(button("primary").classList.contains("nol-button-secondary")).toBe(false);
    expect(button("secondary").classList.contains("nol-button-secondary")).toBe(true);
    expect([button("text").classList.contains("nol-button-text"), button("text").classList.contains("nol-button-secondary"), button("primary").classList.contains("nol-button-text")])
      .toEqual([true, false, false]);
    expect(getComputedStyle(button("primary")).opacity).toBe("0.5");
    expect(getComputedStyle(button("primary")).cursor).toBe("default");
  });

  it("gives a native link the primary button's look without an underline, keeping its own address", async () => {
    render();
    const link = DomFixture.oneOf(DomFixture.host(fixture), "a.link", HTMLAnchorElement);
    const style = getComputedStyle(link);
    const primary = getComputedStyle(button("primary"));

    expect(link.getAttribute("href")).toBe("#guide");
    expect(link.textContent).toBe("Read the guide");
    expect(style.textDecorationLine).toBe("none");
    expect([style.display, style.backgroundColor, style.color, style.fontSize, style.minHeight, style.paddingLeft, style.borderTopLeftRadius, style.cursor])
      .toEqual([primary.display, primary.backgroundColor, primary.color, primary.fontSize, primary.minHeight, primary.paddingLeft, primary.borderTopLeftRadius, "pointer"]);
    await userEvent.hover(link);
    expect(getComputedStyle(link).backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "button-hover"));
  });

  it("starts a label too long for its width at its start padding and ends it with an ellipsis, inside the width its parent gives it", () => {
    render();
    const long = button("long");
    const label = DomFixture.one(long, "[data-truncates]");
    const style = getComputedStyle(long);

    expect(label.classList.contains("nol-button-label")).toBe(true);
    expect(long.getBoundingClientRect().width).toBeCloseTo((long.parentElement as HTMLElement).getBoundingClientRect().width, 1);
    AppearanceFixture.expectPixels(label.getBoundingClientRect().left - long.getBoundingClientRect().left, parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft));
    AppearanceFixture.expectPixels(long.getBoundingClientRect().right - label.getBoundingClientRect().right, parseFloat(style.borderRightWidth) + parseFloat(style.paddingRight));
    expect([label.scrollWidth > label.clientWidth, getComputedStyle(label).textOverflow, getComputedStyle(label).whiteSpace]).toEqual([true, "ellipsis", "nowrap"]);
    expect(button("primary").querySelector("[data-truncates]")?.scrollWidth).toBe(button("primary").querySelector("[data-truncates]")?.clientWidth);
  });

  it("keeps a disabled button's long label cut with an ellipsis inside the width its parent gives it", () => {
    render();
    const unavailable = button("unavailable");
    const label = DomFixture.one(unavailable, "[data-truncates]");

    expect(unavailable.disabled).toBe(true);
    expect(unavailable.getBoundingClientRect().width).toBeCloseTo((unavailable.parentElement as HTMLElement).getBoundingClientRect().width, 1);
    expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(unavailable.getBoundingClientRect().right);
    expect([label.scrollWidth > label.clientWidth, getComputedStyle(label).textOverflow]).toEqual([true, "ellipsis"]);
  });

  it("puts an icon before its label, outside it, at its start padding and whole while the label is cut", () => {
    render();
    const icon = button("icon");
    const glyph = DomFixture.one(icon, ".glyph");
    const label = DomFixture.one(icon, "[data-truncates]");
    const style = getComputedStyle(icon);

    expect(label.contains(glyph)).toBe(false);
    AppearanceFixture.expectPixels(glyph.getBoundingClientRect().left - icon.getBoundingClientRect().left, parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft));
    AppearanceFixture.expectPixels(glyph.getBoundingClientRect().width, AppearanceFixture.toPixels(1));
    AppearanceFixture.expectPixels(label.getBoundingClientRect().left - glyph.getBoundingClientRect().right, AppearanceFixture.toPixels(0.25));
    expect(label.scrollWidth > label.clientWidth).toBe(true);
    expect(button("primary").querySelector(".nol-button-icon")?.getBoundingClientRect().width).toBe(0);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`takes its colors and geometry from the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const primary = getComputedStyle(button("primary"));
        const secondary = getComputedStyle(button("secondary"));

        expect(primary.backgroundColor).toBe(AppearanceFixture.readColor(theme, mode, "button"));
        expect(primary.color).toBe(AppearanceFixture.readColor(theme, mode, "button-text"));
        expect(secondary.color).toBe(AppearanceFixture.readColor(theme, mode, "button-secondary-text"));
        AppearanceFixture.expectLook(primary.minHeight, theme, "button-height", "min-height");
        AppearanceFixture.expectLook(primary.paddingLeft, theme, "button-padding", "padding-left");
        AppearanceFixture.expectLook(primary.paddingRight, theme, "button-padding", "padding-right");
        AppearanceFixture.expectLook(primary.borderTopLeftRadius, theme, "radius-small", "border-top-left-radius");
        AppearanceFixture.expectLook(primary.borderTopWidth, theme, "border-width", "border-top-width");
      });

  it("uses the hover fills of its variant", async () => {
    render();

    await userEvent.hover(button("primary"));
    expect(getComputedStyle(button("primary")).backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "button-hover"));
    await userEvent.hover(button("secondary"));
    expect(getComputedStyle(button("secondary")).backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "button-secondary-hover"));
  });

  it("looks disabled without a hover fill while aria-disabled marks it unavailable, staying focusable", async () => {
    render();

    await userEvent.hover(button("locked"));
    button("locked").focus();
    const style = getComputedStyle(button("locked"));

    expect([style.opacity, style.cursor, style.backgroundColor]).toEqual(["0.5", "default", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "button")]);
    expect(document.activeElement).toBe(button("locked"));
  });

  it("shows keyboard focus outside its fill, so the outline never blends into a primary button", async () => {
    render();

    await userEvent.tab();
    const style = getComputedStyle(button("primary"));

    expect(document.activeElement).toBe(button("primary"));
    expect(style.outlineColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent"));
    expect(style.outlineOffset).toBe("2px");
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`fills a danger button with the error color under its own label, at the primary button's size, from the ${theme.id} theme in ${mode} mode`, async () => {
        render(theme, mode);
        const danger = button("danger");
        const style = getComputedStyle(danger);
        const primary = getComputedStyle(button("keep"));
        const box = danger.getBoundingClientRect();
        const primaryBox = button("keep").getBoundingClientRect();
        const error = AppearanceFixture.readColor(theme, mode, "error");
        const label = AppearanceFixture.readColor(theme, mode, "button-danger-text");

        expect([danger.classList.contains("nol-button-danger"), button("keep").classList.contains("nol-button-danger")]).toEqual([true, false]);
        expect([style.backgroundColor, style.color]).toEqual([error, label]);
        AppearanceFixture.expectPixels(box.width, primaryBox.width);
        AppearanceFixture.expectPixels(box.height, primaryBox.height);
        expect([style.minHeight, style.paddingLeft, style.paddingRight, style.borderTopWidth, style.borderTopColor, style.borderTopLeftRadius, style.fontSize, style.lineHeight])
          .toEqual([primary.minHeight, primary.paddingLeft, primary.paddingRight, primary.borderTopWidth, primary.borderTopColor, primary.borderTopLeftRadius, primary.fontSize, primary.lineHeight]);
        await userEvent.hover(danger);
        expect(getComputedStyle(danger).backgroundColor).toBe(GalleryFixture.colorOf(danger.parentElement as HTMLElement, "background-color", `color-mix(in srgb, ${error} 90%, ${label})`));
        expect(getComputedStyle(danger).color).toBe(label);
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps a danger button's label at 4.5:1 on its fill and on its hover in ${mode} mode`, () => {
      render(DefaultTheme.theme, mode);
      const label = AppearanceFixture.readColor(DefaultTheme.theme, mode, "button-danger-text");
      const [error, text] = [AppearanceFixture.readColor(DefaultTheme.theme, mode, "error"), label].map(t => (t.match(/\d+/gu) ?? []).map(Number));
      const hover = `rgb(${(error ?? []).map((t, i) => Math.round(t * 0.9 + (text?.[i] ?? 0) * 0.1)).join(", ")})`;

      expect(getComputedStyle(button("danger")).color).toBe(label);
      expect(AppearanceFixture.contrast(label, getComputedStyle(button("danger")).backgroundColor)).toBeGreaterThanOrEqual(4.5);
      expect(AppearanceFixture.contrast(label, hover)).toBeGreaterThanOrEqual(4.5);
    });

  it("gives a disabled danger button the primary button's disabled look, without the danger hover", async () => {
    render();
    const fill = AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "error");

    for (const name of ["danger-off", "danger-locked"]) {
      await userEvent.hover(button(name));
      const style = getComputedStyle(button(name));

      expect([style.opacity, style.cursor, style.backgroundColor]).toEqual(["0.5", "default", fill]);
    }
  });

  it("shows keyboard focus on a danger button outside its fill, in the accent color", async () => {
    render();

    for (let presses = 0; presses < 20 && document.activeElement !== button("danger"); presses++)
      await userEvent.tab();
    expect(document.activeElement).toBe(button("danger"));
    const style = getComputedStyle(button("danger"));

    expect([style.outlineStyle, style.outlineColor, style.outlineOffset]).toEqual(["solid", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent"), "2px"]);
  });

  it("ignores danger on a secondary or a text button, which keeps its own look", () => {
    render();

    for (const [name, look] of [["danger-secondary", "secondary"], ["danger-text", "text"]] as const) {
      const style = getComputedStyle(button(name));
      const own = getComputedStyle(button(look));

      expect(button(name).classList.contains("nol-button-danger")).toBe(false);
      expect([style.backgroundColor, style.color]).toEqual([own.backgroundColor, own.color]);
    }
  });

  for (const mode of AppearanceFixture.modes)
    it(`draws a disabled or aria-disabled button's border and label in GrayText under forced colors, and an available one's in ButtonText, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();
      const ink = (name: string): readonly string[] => [getComputedStyle(button(name)).borderTopColor, getComputedStyle(button(name)).color];
      const gray = ForcedColorsFixture.resolve("GrayText");
      const text = ForcedColorsFixture.resolve("ButtonText");

      expect([ink("keep"), ink("unavailable"), ink("locked"), ink("danger-locked")]).toEqual([[text, text], [gray, gray], [gray, gray], [gray, gray]]);
    });

  for (const mode of AppearanceFixture.modes)
    it(`keeps a disabled or aria-disabled button of every variant at full opacity under forced colors, so its label stays GrayText, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();
      button("text").disabled = true;
      button("danger-text").setAttribute("aria-disabled", "true");
      button("secondary").disabled = true;
      const gray = ForcedColorsFixture.resolve("GrayText");
      const look = (name: string): readonly string[] => [getComputedStyle(button(name)).color, getComputedStyle(button(name)).opacity];

      expect(["text", "danger-text", "secondary", "unavailable", "locked"].map(look)).toEqual(Array<readonly string[]>(5).fill([gray, "1"]));
    });

  for (const mode of AppearanceFixture.modes)
    it(`draws a danger button as the plain primary button under forced colors, at rest, on hover, on focus and while disabled or aria-disabled, at the same size, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      await userEvent.hover(button("secondary"));
      const before = button("danger").getBoundingClientRect();
      await ForcedColorsFixture.activateAsync();
      const width = AppearanceFixture.measureLook("border-width");
      const highlight = ForcedColorsFixture.resolve("Highlight");
      const look = (name: string, state?: string): readonly unknown[] => {
        if (state)
          button(name).setAttribute("data-nol-state", state);
        const style = getComputedStyle(button(name));
        const seen = [style.backgroundColor, style.color, style.borderTopStyle, parseFloat(style.borderTopWidth), style.borderTopColor, style.opacity,
          style.outlineStyle, parseFloat(style.outlineWidth), style.outlineColor];
        button(name).removeAttribute("data-nol-state");
        return seen;
      };

      expect([look("danger"), look("danger", "Hover"), look("danger", "Focus"), look("danger-off", "Hover"), look("danger-locked", "Hover")])
        .toEqual([look("keep"), look("keep", "Hover"), look("keep", "Focus"), look("unavailable", "Hover"), look("locked", "Hover")]);
      expect([look("danger", "Hover").slice(6), look("danger", "Focus").slice(6), look("danger-off", "Hover")[6]]).toEqual([["dashed", width, highlight], ["solid", width * 2, highlight], "none"]);
      AppearanceFixture.expectPixels(button("danger").getBoundingClientRect().width, before.width);
      AppearanceFixture.expectPixels(button("danger").getBoundingClientRect().height, before.height);
      AppearanceFixture.expectPixels(button("danger").getBoundingClientRect().width, button("keep").getBoundingClientRect().width);
    });

  for (const mode of AppearanceFixture.modes)
    it(`draws the hover dashes under forced colors at least one border width inside the border of every kind of button, so a hovered button differs from a resting one, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();
      const width = AppearanceFixture.measureLook("border-width");
      const gaps = ["primary", "secondary", "danger", "danger-secondary", "text"].map(name => {
        button(name).setAttribute("data-nol-state", "Hover");
        const style = getComputedStyle(button(name));
        const seen = [style.outlineStyle, parseFloat(style.outlineWidth), style.outlineColor, -parseFloat(style.outlineOffset) - parseFloat(style.outlineWidth) - parseFloat(style.borderTopWidth)];
        button(name).removeAttribute("data-nol-state");
        return seen;
      });
      const highlight = ForcedColorsFixture.resolve("Highlight");

      expect(gaps.map(t => t.slice(0, 3))).toEqual(gaps.map(() => ["dashed", width, highlight]));
      expect(gaps.every(t => Number(t[3]) >= width)).toBe(true);
      AppearanceFixture.expectPixels(parseFloat(getComputedStyle(button("primary")).borderTopWidth), width);
    });

  for (const panelSize of AppearanceFixture.panelSizes)
    it(`scales its height and padding with panel size ${panelSize} while its border keeps one pixel`, () => {
      render(DefaultTheme.theme, ThemeMode.Light, panelSize);
      const style = getComputedStyle(button("primary"));

      AppearanceFixture.expectRem(style.minHeight, 1.625, panelSize);
      AppearanceFixture.expectRem(style.paddingLeft, 0.5, panelSize);
      expect(style.borderTopWidth).toBe("1px");
    });
});
