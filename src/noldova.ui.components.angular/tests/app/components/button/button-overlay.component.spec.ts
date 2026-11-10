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
import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { ButtonVariant } from "../../../../src/app/enums/button-variant";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [ButtonComponent, IconButtonComponent],
  template: `
    <button type="button" class="plain" nol-button [variant]="text">Restart</button>
    <button type="button" class="fit" data-testid="fit" nol-button [variant]="text" [overlay]="true">100%</button>
    <button type="button" class="off" nol-button [variant]="text" [overlay]="true" disabled>100%</button>
    <button type="button" class="locked" nol-button [variant]="text" [overlay]="true" aria-disabled="true">100%</button>
    <button type="button" class="primary" nol-button [overlay]="true">Move aside</button>
    <div class="row" style="display: flex; align-items: center; gap: 0.25rem">
      <button type="button" class="zoom-out" nol-icon-button icon="zoom_out" label="Zoom out" [overlay]="true" [buttonHeight]="true"></button>
      <button type="button" class="zoom-fit" nol-button [variant]="text" [overlay]="true">100%</button>
      <button type="button" class="zoom-in" nol-icon-button icon="zoom_in" label="Zoom in" [overlay]="true" [buttonHeight]="true"></button>
    </div>
    <button type="button" class="remove" nol-icon-button icon="close" label="Remove" [overlay]="true"></button>
    <button type="button" class="lifted" data-testid="lifted" nol-button [variant]="text" [overlay]="true" [backdrop]="true">100%</button>
    <button type="button" class="lifted-off" nol-button [variant]="text" [overlay]="true" [backdrop]="true" disabled>100%</button>
    <button type="button" class="lifted-locked" nol-button [variant]="text" [overlay]="true" [backdrop]="true" aria-disabled="true">100%</button>
    <button type="button" class="lifted-primary" nol-button [overlay]="true" [backdrop]="true">Move aside</button>
    <div class="probe"></div>
  `
})
class OverlayButtonHostComponent {
  protected readonly text: ButtonVariant = ButtonVariant.Text;
}

describe("ButtonComponent's overlay look", () => {
  let fixture: ComponentFixture<OverlayButtonHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(OverlayButtonHostComponent);
    fixture.detectChanges();
  }

  const button = (name: string): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), `button.${name}`, HTMLButtonElement);
  const style = (name: string): CSSStyleDeclaration => getComputedStyle(button(name));
  const hoverLayer = (token = "toolbar-hover"): string => {
    const probe = DomFixture.one(DomFixture.host(fixture), ".probe");
    probe.style.backgroundImage = `linear-gradient(var(--nol-${token}), var(--nol-${token}))`;
    return getComputedStyle(probe).backgroundImage;
  };
  const over = (fill: string, ground: number): string => {
    const [red = 0, green = 0, blue = 0, alpha = 1] = (fill.match(/\d+(\.\d+)?/gu) ?? []).map(Number);
    return `rgb(${[red, green, blue].map(t => Math.round(t * alpha + ground * (1 - alpha))).join(", ")})`;
  };

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`fills a pill with the theme's overlay and its label in the overlay text, at the button's height, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const height = button("fit").getBoundingClientRect().height;

        expect([button("fit").classList.contains("nol-button-overlay"), button("plain").classList.contains("nol-button-overlay")]).toEqual([true, false]);
        expect([style("fit").backgroundImage, style("fit").borderTopStyle, style("fit").borderTopColor]).toEqual(["none", "solid", "rgba(0, 0, 0, 0)"]);
        AppearanceFixture.expectLook(style("fit").backgroundColor, theme, "overlay", "background-color");
        AppearanceFixture.expectLook(style("fit").color, theme, "overlay-text", "color");
        AppearanceFixture.expectLook(style("fit").borderTopWidth, theme, "border-width", "border-top-width");
        AppearanceFixture.expectPixels(height, AppearanceFixture.measureLook("button-height"));
        AppearanceFixture.expectPixels(parseFloat(style("fit").borderTopLeftRadius), height / 2);
        AppearanceFixture.expectPixels(parseFloat(style("fit").borderBottomRightRadius), height / 2);
        AppearanceFixture.expectPixels(button("fit").getBoundingClientRect().width, AppearanceFixture.toPixels(4));
      });

  it("keeps its white label at least 4.5:1 on its fill over a white image and over a black one", () => {
    render();
    const fill = style("fit").backgroundColor;

    expect([over(fill, 255), over(fill, 0)]).toEqual(["rgb(77, 77, 77)", "rgb(0, 0, 0)"]);
    expect([AppearanceFixture.contrast(style("fit").color, over(fill, 255)), AppearanceFixture.contrast(style("fit").color, over(fill, 0))].every(t => t >= 4.5)).toBe(true);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`shares one height and centre line with the overlay icon buttons that take the button's height in a row, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const pill = button("zoom-fit").getBoundingClientRect();
        const circle = (name: string): readonly number[] => {
          const box = button(name).getBoundingClientRect();
          const pad = getComputedStyle(button(name), "::before");
          return [parseFloat(pad.width), parseFloat(pad.height), box.top + box.height / 2, box.height];
        };
        const centre = pill.top + pill.height / 2;

        for (const name of ["zoom-out", "zoom-in"]) {
          const [width = 0, height = 0, middle = 0, box = 0] = circle(name);
          AppearanceFixture.expectPixels(height, pill.height);
          AppearanceFixture.expectPixels(width, pill.height);
          AppearanceFixture.expectPixels(box, pill.height);
          AppearanceFixture.expectPixels(middle, centre);
          expect([button(name).classList.contains("nol-icon-button-tall"), getComputedStyle(button(name), "::before").borderTopLeftRadius]).toEqual([true, "50%"]);
        }
        AppearanceFixture.expectPixels(pill.height, AppearanceFixture.measureLook("button-height"));
        AppearanceFixture.expectLook(getComputedStyle(button("remove"), "::before").height, theme, "icon-button", "height");
        expect(button("remove").classList.contains("nol-icon-button-tall")).toBe(false);
      });

  it("is only a look of the text variant, so another variant keeps its own", () => {
    render();

    expect([button("primary").classList.contains("nol-button-overlay"), style("primary").backgroundColor])
      .toEqual([false, AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "button")]);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`lays the toolbar hover over its fill under the pointer, in the ${theme.id} theme in ${mode} mode`, async () => {
        render(theme, mode);
        const [fill, label] = [style("fit").backgroundColor, style("fit").color];

        await userEvent.hover(page.getByTestId("fit"));

        expect([style("fit").backgroundColor, style("fit").backgroundImage, style("fit").color]).toEqual([fill, `${hoverLayer()}, none`, label]);
        expect(hoverLayer()).toContain("linear-gradient");
      });

  for (const mode of AppearanceFixture.modes)
    it(`shows keyboard focus as the accent outline outside its pill, two border widths from it, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);

      button("plain").focus();
      await userEvent.tab();

      expect(document.activeElement).toBe(button("fit"));
      expect([style("fit").outlineStyle, style("fit").outlineWidth, style("fit").outlineColor])
        .toEqual(["solid", "1px", AppearanceFixture.readColor(DefaultTheme.theme, mode, "accent")]);
      AppearanceFixture.expectPixels(parseFloat(style("fit").outlineOffset), AppearanceFixture.measureLook("border-width") * 2);
    });

  for (const mode of AppearanceFixture.modes)
    it(`is at half opacity while disabled or aria-disabled, without the hover layer under the pointer, at the same size, in ${mode} mode`, () => {
      render(DefaultTheme.theme, mode);

      for (const name of ["off", "locked"]) {
        button(name).setAttribute("data-nol-state", "Hover");

        expect([style(name).backgroundColor, style(name).backgroundImage, style(name).color, style(name).opacity, style(name).cursor])
          .toEqual([style("fit").backgroundColor, "none", style("fit").color, "0.5", "default"]);
        AppearanceFixture.expectPixels(button(name).getBoundingClientRect().width, button("fit").getBoundingClientRect().width);
        AppearanceFixture.expectPixels(button(name).getBoundingClientRect().height, button("fit").getBoundingClientRect().height);
      }
    });

  for (const mode of AppearanceFixture.modes)
    it(`is a ButtonText ring around a ButtonText label under forced colors, or GrayText while disabled or aria-disabled, with the Highlight focus outline, at the same size, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      const before = button("fit").getBoundingClientRect();
      await ForcedColorsFixture.activateAsync();
      const width = AppearanceFixture.measureLook("border-width");
      const ring = (name: string): readonly unknown[] => [style(name).borderTopStyle, parseFloat(style(name).borderTopWidth), style(name).borderTopColor, style(name).color];

      expect([ring("fit"), ring("off"), ring("locked")]).toEqual([
        ["solid", width, ForcedColorsFixture.resolve("ButtonText"), ForcedColorsFixture.resolve("ButtonText")],
        ["solid", width, ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")],
        ["solid", width, ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")]
      ]);
      expect(style("fit").backgroundColor).toBe(ForcedColorsFixture.resolve("ButtonFace"));
      AppearanceFixture.expectPixels(button("fit").getBoundingClientRect().width, before.width);
      AppearanceFixture.expectPixels(button("fit").getBoundingClientRect().height, before.height);

      button("fit").setAttribute("data-nol-state", "Focus");
      expect([style("fit").outlineStyle, parseFloat(style("fit").outlineWidth), style("fit").outlineColor]).toEqual(["solid", width * 2, ForcedColorsFixture.resolve("Highlight")]);
      AppearanceFixture.expectPixels(parseFloat(style("fit").outlineOffset), width * 2);
    });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`fills its pill with the overlay control on the overlay backdrop, at the overlay look's size with its label in the overlay control's text, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const [box, idle] = [button("lifted").getBoundingClientRect(), button("fit").getBoundingClientRect()];

        expect(["lifted", "fit", "lifted-primary"].map(t => button(t).classList.contains("nol-button-backdrop"))).toEqual([true, false, false]);
        expect([style("lifted").backgroundImage, style("lifted").borderTopColor, style("lifted-primary").backgroundColor]).toEqual(["none", "rgba(0, 0, 0, 0)", style("primary").backgroundColor]);
        AppearanceFixture.expectLook(style("lifted").backgroundColor, theme, "overlay-control", "background-color");
        AppearanceFixture.expectLook(style("fit").backgroundColor, theme, "overlay", "background-color");
        AppearanceFixture.expectLook(style("lifted").color, theme, "overlay-control-text", "color");
        AppearanceFixture.expectLook(style("fit").color, theme, "overlay-text", "color");
        AppearanceFixture.expectPixels(box.height, AppearanceFixture.measureLook("button-height"));
        AppearanceFixture.expectPixels(box.width, idle.width);
        AppearanceFixture.expectPixels(parseFloat(style("lifted").borderTopLeftRadius), box.height / 2);
        AppearanceFixture.expectPixels(parseFloat(style("lifted").borderBottomRightRadius), box.height / 2);
      });

  it("keeps its #EEEEEE label at least 4.5:1 on its fill over the overlay backdrop, whether a white or a black page lies under it", () => {
    render();
    const [light, dark] = [over(style("fit").backgroundColor, 255), over(style("fit").backgroundColor, 0)].map(t => Number.parseInt(t.slice(4), 10));
    const grounds = [over(style("lifted").backgroundColor, light ?? 0), over(style("lifted").backgroundColor, dark ?? 0)];

    expect([grounds, style("lifted").color]).toEqual([["rgb(95, 95, 95)", "rgb(26, 26, 26)"], "rgb(238, 238, 238)"]);
    expect(grounds.every(t => AppearanceFixture.contrast(style("lifted").color, t) >= 4.5)).toBe(true);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`lays the overlay control's hover over its fill under the pointer, at the same size, on the overlay backdrop, in the ${theme.id} theme in ${mode} mode`, async () => {
        render(theme, mode);
        const [fill, label, before] = [style("lifted").backgroundColor, style("lifted").color, button("lifted").getBoundingClientRect()];

        await userEvent.hover(page.getByTestId("lifted"));

        expect([style("lifted").backgroundColor, style("lifted").backgroundImage, style("lifted").color]).toEqual([fill, `${hoverLayer("overlay-control-hover")}, none`, label]);
        expect(hoverLayer("overlay-control-hover")).toContain("linear-gradient");
        AppearanceFixture.expectPixels(button("lifted").getBoundingClientRect().width, before.width);
        AppearanceFixture.expectPixels(button("lifted").getBoundingClientRect().height, before.height);
        AppearanceFixture.expectPixels(parseFloat(style("lifted").borderTopLeftRadius), before.height / 2);
      });

  for (const mode of AppearanceFixture.modes)
    it(`is at 35% opacity on the overlay control's fill while disabled or aria-disabled on the overlay backdrop, without the hover layer under the pointer, in ${mode} mode`, () => {
      render(DefaultTheme.theme, mode);
      const look = (name: string): readonly string[] => [style(name).backgroundColor, style(name).backgroundImage, style(name).opacity];
      button("lifted-off").setAttribute("data-nol-state", "Hover");
      button("lifted-locked").setAttribute("data-nol-state", "Hover");

      expect([look("lifted-off"), look("lifted-locked")]).toEqual([[style("lifted").backgroundColor, "none", "0.35"], [style("lifted").backgroundColor, "none", "0.35"]]);
    });

  for (const mode of AppearanceFixture.modes)
    it(`keeps the overlay look under forced colors on the overlay backdrop, idle, hovered and disabled, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();
      const look = (name: string): readonly string[] => [style(name).backgroundColor, style(name).backgroundImage, style(name).borderTopColor, style(name).color, style(name).opacity];

      expect([look("lifted"), look("lifted-off"), look("lifted-locked")]).toEqual([look("fit"), look("off"), look("locked")]);
      expect(style("lifted").backgroundColor).toBe(ForcedColorsFixture.resolve("ButtonFace"));
      button("lifted").setAttribute("data-nol-state", "Hover");
      button("fit").setAttribute("data-nol-state", "Hover");
      expect(look("lifted")).toEqual(look("fit"));
    });
});
