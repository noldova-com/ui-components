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

import { IconButtonComponent } from "../../../../src/app/components/icon-button/icon-button.component";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [IconButtonComponent],
  template: `
    <button type="button" class="plain" nol-icon-button icon="add" label="Add files"></button>
    <button type="button" class="remove" data-testid="remove" nol-icon-button icon="close" label="Remove" [overlay]="true"></button>
    <button type="button" class="off" nol-icon-button icon="close" label="Remove" [overlay]="true" disabled></button>
    <button type="button" class="locked" nol-icon-button icon="close" label="Remove" [overlay]="true" aria-disabled="true"></button>
    <button type="button" class="both" nol-icon-button icon="send" label="Send" [filled]="true" [overlay]="true"></button>
    <button type="button" class="pinned" nol-icon-button icon="push_pin" label="Pin" [overlay]="true" [pressed]="true"></button>
    <button type="button" class="pinned-locked" nol-icon-button icon="push_pin" label="Pin" [overlay]="true" [pressed]="true" aria-disabled="true"></button>
    <button type="button" class="lifted" data-testid="lifted" nol-icon-button icon="close" label="Close" [overlay]="true" [backdrop]="true"></button>
    <button type="button" class="lifted-off" nol-icon-button icon="close" label="Close" [overlay]="true" [backdrop]="true" disabled></button>
    <button type="button" class="lifted-locked" nol-icon-button icon="close" label="Close" [overlay]="true" [backdrop]="true" aria-disabled="true"></button>
    <button type="button" class="lifted-pinned" nol-icon-button icon="push_pin" label="Pin" [overlay]="true" [backdrop]="true" [pressed]="true"></button>
    <button type="button" class="lifted-both" nol-icon-button icon="send" label="Send" [filled]="true" [overlay]="true" [backdrop]="true"></button>
    <button type="button" class="lifted-plain" nol-icon-button icon="add" label="Add files" [backdrop]="true"></button>
    <div class="probe"></div>
  `
})
class OverlayIconButtonHostComponent {}

describe("IconButtonComponent's overlay look", () => {
  const overlay = "rgba(0, 0, 0, 0.7)";
  const white = "rgb(255, 255, 255)";
  let fixture: ComponentFixture<OverlayIconButtonHostComponent>;

  function render(theme = DefaultTheme.theme, mode = ThemeMode.Light): void {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(OverlayIconButtonHostComponent);
    fixture.detectChanges();
  }

  const button = (name: string): HTMLButtonElement => DomFixture.oneOf(DomFixture.host(fixture), `button.${name}`, HTMLButtonElement);
  const pad = (name: string): CSSStyleDeclaration => getComputedStyle(button(name), "::before");
  const glyph = (name: string): DOMRect => DomFixture.one(button(name), ".nol-icon-button-glyph").getBoundingClientRect();
  const center = (box: DOMRect): readonly [number, number] => [box.left + box.width / 2, box.top + box.height / 2];
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
      it(`fills a circle the icon button's size across with the theme's overlay and its glyph in the overlay text, the same in light and dark, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const size = AppearanceFixture.measureLook("icon-button");
        const box = button("remove").getBoundingClientRect();
        const [glyphX, glyphY] = center(glyph("remove"));
        const [boxX, boxY] = center(box);

        expect([button("remove").classList.contains("nol-icon-button-overlay"), button("plain").classList.contains("nol-icon-button-overlay")]).toEqual([true, false]);
        expect([pad("remove").backgroundImage, pad("remove").borderTopLeftRadius]).toEqual(["none", "50%"]);
        AppearanceFixture.expectLook(pad("remove").backgroundColor, theme, "overlay", "background-color");
        AppearanceFixture.expectLook(getComputedStyle(button("remove")).color, theme, "overlay-text", "color");
        AppearanceFixture.expectLook(pad("remove").width, theme, "icon-button", "width");
        AppearanceFixture.expectLook(pad("remove").height, theme, "icon-button", "height");
        AppearanceFixture.expectPixels(box.width, Math.max(24, size));
        AppearanceFixture.expectPixels(box.height, Math.max(24, size));
        AppearanceFixture.expectPixels(glyphX, boxX);
        AppearanceFixture.expectPixels(glyphY, boxY);
        AppearanceFixture.expectLook(getComputedStyle(DomFixture.one(button("remove"), ".nol-icon-button-glyph")).fontSize, theme, "icon", "font-size");
      });

  it("keeps its white glyph at least 4.5:1 on its fill over a white image and over a black one", () => {
    render();
    const fill = pad("remove").backgroundColor;
    const text = getComputedStyle(button("remove")).color;

    expect([over(fill, 255), over(fill, 0)]).toEqual(["rgb(77, 77, 77)", "rgb(0, 0, 0)"]);
    expect([AppearanceFixture.contrast(text, over(fill, 255)), AppearanceFixture.contrast(text, over(fill, 0))].every(t => t >= 4.5)).toBe(true);
  });

  it("takes the filled look when both are set", () => {
    render();

    expect([button("both").classList.contains("nol-icon-button-filled"), button("both").classList.contains("nol-icon-button-overlay")]).toEqual([true, false]);
    expect(pad("both").backgroundColor).toBe(AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "button"));
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`lays the toolbar hover over its fill under the pointer, in the ${theme.id} theme in ${mode} mode`, async () => {
        render(theme, mode);
        const fill = pad("remove").backgroundColor;

        await userEvent.hover(page.getByTestId("remove"));

        expect([pad("remove").backgroundColor, pad("remove").backgroundImage]).toEqual([fill, `${hoverLayer()}, none`]);
        expect(hoverLayer()).toContain("linear-gradient");
      });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`lays the toolbar hover over its fill while pressed, its glyph in the overlay text, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);

        expect([button("pinned").getAttribute("aria-pressed"), pad("pinned").backgroundColor, pad("pinned").backgroundImage, getComputedStyle(button("pinned")).color])
          .toEqual(["true", pad("remove").backgroundColor, `${hoverLayer()}, none`, getComputedStyle(button("remove")).color]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`shows its pressed look under forced colors, a HighlightText glyph on Highlight inside its ButtonText ring, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();

      expect([pad("pinned").backgroundColor, getComputedStyle(button("pinned")).color, pad("pinned").borderTopColor, pad("remove").backgroundColor]).toEqual([
        ForcedColorsFixture.resolve("Highlight"), ForcedColorsFixture.resolve("HighlightText"), ForcedColorsFixture.resolve("ButtonText"), ForcedColorsFixture.resolve("ButtonFace")
      ]);
    });

  for (const mode of AppearanceFixture.modes)
    it(`draws a pressed one that is aria-disabled under forced colors as a GrayText glyph on Canvas inside its GrayText ring, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();
      const gray = ForcedColorsFixture.resolve("GrayText");

      expect([pad("pinned-locked").backgroundColor, pad("pinned-locked").backgroundImage, getComputedStyle(button("pinned-locked")).color, pad("pinned-locked").borderTopColor, pad("pinned-locked").outlineColor])
        .toEqual([ForcedColorsFixture.resolve("Canvas"), "none", gray, gray, gray]);
    });

  it("shows keyboard focus as the accent outline outside its circle", async () => {
    render();

    button("plain").focus();
    await userEvent.tab();

    expect(document.activeElement).toBe(button("remove"));
    expect([pad("remove").outlineStyle, pad("remove").outlineWidth, pad("remove").outlineColor])
      .toEqual(["solid", "1px", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "accent")]);
    AppearanceFixture.expectPixels(parseFloat(pad("remove").outlineOffset), AppearanceFixture.measureLook("border-width") * 2);
  });

  for (const mode of AppearanceFixture.modes)
    it(`is at half opacity while disabled or aria-disabled, without the hover layer under the pointer, at the same size, in ${mode} mode`, () => {
      render(DefaultTheme.theme, mode);

      for (const name of ["off", "locked"]) {
        button(name).setAttribute("data-nol-state", "Hover");
        const style = getComputedStyle(button(name));

        expect([pad(name).backgroundColor, pad(name).backgroundImage, style.color, style.opacity, style.cursor]).toEqual([overlay, "none", white, "0.5", "default"]);
        AppearanceFixture.expectPixels(button(name).getBoundingClientRect().width, button("remove").getBoundingClientRect().width);
        AppearanceFixture.expectLook(pad(name).width, DefaultTheme.theme, "icon-button", "width");
      }
    });

  for (const mode of AppearanceFixture.modes)
    it(`is a ButtonText ring around a ButtonText glyph under forced colors, or GrayText while disabled or aria-disabled, at the same size, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      const before = [button("remove").getBoundingClientRect().width, parseFloat(pad("remove").width)];
      await ForcedColorsFixture.activateAsync();
      const width = AppearanceFixture.measureLook("border-width");
      const ring = (name: string): readonly unknown[] => [pad(name).borderTopStyle, parseFloat(pad(name).borderTopWidth), pad(name).borderTopColor, getComputedStyle(button(name)).color];

      expect([ring("remove"), ring("off"), ring("locked")]).toEqual([
        ["solid", width, ForcedColorsFixture.resolve("ButtonText"), ForcedColorsFixture.resolve("ButtonText")],
        ["solid", width, ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")],
        ["solid", width, ForcedColorsFixture.resolve("GrayText"), ForcedColorsFixture.resolve("GrayText")]
      ]);
      expect(pad("remove").backgroundColor).toBe(ForcedColorsFixture.resolve("ButtonFace"));
      AppearanceFixture.expectPixels(button("remove").getBoundingClientRect().width, before[0] as number);
      AppearanceFixture.expectPixels(parseFloat(pad("remove").width), before[1] as number);
    });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`fills its circle with the overlay control on the overlay backdrop, at the overlay look's size with its glyph in the overlay control's text, in the ${theme.id} theme in ${mode} mode`, () => {
        render(theme, mode);
        const [box, idle] = [button("lifted").getBoundingClientRect(), button("remove").getBoundingClientRect()];

        expect(["lifted", "lifted-pinned", "remove", "lifted-both", "lifted-plain"].map(t => button(t).classList.contains("nol-icon-button-backdrop")))
          .toEqual([true, true, false, false, false]);
        expect([pad("lifted").backgroundImage, pad("lifted").borderTopLeftRadius]).toEqual(["none", "50%"]);
        expect([pad("lifted-both").backgroundColor, pad("lifted-plain").backgroundColor]).toEqual([pad("both").backgroundColor, pad("plain").backgroundColor]);
        AppearanceFixture.expectLook(pad("lifted").backgroundColor, theme, "overlay-control", "background-color");
        AppearanceFixture.expectLook(pad("remove").backgroundColor, theme, "overlay", "background-color");
        AppearanceFixture.expectLook(getComputedStyle(button("lifted")).color, theme, "overlay-control-text", "color");
        AppearanceFixture.expectLook(getComputedStyle(button("remove")).color, theme, "overlay-text", "color");
        AppearanceFixture.expectLook(pad("lifted").width, theme, "icon-button", "width");
        AppearanceFixture.expectLook(pad("lifted").height, theme, "icon-button", "height");
        AppearanceFixture.expectPixels(box.width, idle.width);
        AppearanceFixture.expectPixels(box.height, idle.height);
      });

  it("keeps its #EEEEEE glyph at least 4.5:1 on its fill over the overlay backdrop, whether a white or a black page lies under it", () => {
    render();
    const [light, dark] = [over(pad("remove").backgroundColor, 255), over(pad("remove").backgroundColor, 0)].map(t => Number.parseInt(t.slice(4), 10));
    const grounds = [over(pad("lifted").backgroundColor, light ?? 0), over(pad("lifted").backgroundColor, dark ?? 0)];

    expect([grounds, getComputedStyle(button("lifted")).color]).toEqual([["rgb(95, 95, 95)", "rgb(26, 26, 26)"], "rgb(238, 238, 238)"]);
    expect(grounds.every(t => AppearanceFixture.contrast(getComputedStyle(button("lifted")).color, t) >= 4.5)).toBe(true);
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`lays the overlay control's hover over its fill under the pointer and while pressed, at the same size, on the overlay backdrop, in the ${theme.id} theme in ${mode} mode`, async () => {
        render(theme, mode);
        const fill = pad("lifted").backgroundColor;
        const before = [button("lifted").getBoundingClientRect(), parseFloat(pad("lifted").width), parseFloat(pad("lifted").height)] as const;

        await userEvent.hover(page.getByTestId("lifted"));

        expect([pad("lifted").backgroundColor, pad("lifted").backgroundImage, pad("lifted").borderTopLeftRadius]).toEqual([fill, `${hoverLayer("overlay-control-hover")}, none`, "50%"]);
        expect([pad("lifted-pinned").backgroundColor, pad("lifted-pinned").backgroundImage]).toEqual([fill, `${hoverLayer("overlay-control-hover")}, none`]);
        expect(hoverLayer("overlay-control-hover")).toContain("linear-gradient");
        AppearanceFixture.expectPixels(button("lifted").getBoundingClientRect().width, before[0].width);
        AppearanceFixture.expectPixels(button("lifted").getBoundingClientRect().height, before[0].height);
        AppearanceFixture.expectPixels(parseFloat(pad("lifted").width), before[1]);
        AppearanceFixture.expectPixels(parseFloat(pad("lifted").height), before[2]);
      });

  for (const mode of AppearanceFixture.modes)
    it(`is at 35% opacity on the overlay control's fill while disabled or aria-disabled on the overlay backdrop, without the hover layer under the pointer, in ${mode} mode`, () => {
      render(DefaultTheme.theme, mode);
      const look = (name: string): readonly string[] => [pad(name).backgroundColor, pad(name).backgroundImage, getComputedStyle(button(name)).opacity];
      button("lifted-off").setAttribute("data-nol-state", "Hover");
      button("lifted-locked").setAttribute("data-nol-state", "Hover");

      expect([look("lifted-off"), look("lifted-locked")]).toEqual([[pad("lifted").backgroundColor, "none", "0.35"], [pad("lifted").backgroundColor, "none", "0.35"]]);
    });

  for (const mode of AppearanceFixture.modes)
    it(`keeps the overlay look under forced colors on the overlay backdrop, idle, hovered, pressed and disabled, in ${mode} mode`, async () => {
      render(DefaultTheme.theme, mode);
      await ForcedColorsFixture.activateAsync();
      const look = (name: string): readonly string[] => [pad(name).backgroundColor, pad(name).backgroundImage, pad(name).borderTopColor, getComputedStyle(button(name)).color, getComputedStyle(button(name)).opacity];

      expect([look("lifted"), look("lifted-pinned"), look("lifted-off"), look("lifted-locked")]).toEqual([look("remove"), look("pinned"), look("off"), look("locked")]);
      expect(pad("lifted").backgroundColor).toBe(ForcedColorsFixture.resolve("ButtonFace"));
      button("lifted").setAttribute("data-nol-state", "Hover");
      button("remove").setAttribute("data-nol-state", "Hover");
      expect(look("lifted")).toEqual(look("remove"));
    });
});
