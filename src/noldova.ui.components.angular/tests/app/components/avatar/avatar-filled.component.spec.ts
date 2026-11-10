/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Component, signal } from "@angular/core";
import { type ComponentFixture, TestBed } from "@angular/core/testing";

import { AvatarComponent } from "../../../../src/app/components/avatar/avatar.component";
import { AvatarColor } from "../../../../src/app/enums/avatar-color";
import { AvatarSize } from "../../../../src/app/enums/avatar-size";
import { ThemeMode } from "../../../../src/app/enums/theme-mode";
import { AvatarColors } from "../../../../src/app/models/avatar-colors";
import { DefaultTheme } from "../../../../src/app/models/default-theme";
import { AppearanceFixture } from "../../../../src/testing/services/appearance-fixture";
import { DomFixture } from "../../../fixtures/dom.fixture";
import { ForcedColorsFixture } from "../../../fixtures/forced-colors.fixture";

@Component({
  imports: [AvatarComponent],
  template: `<nol-avatar name="ada" [colorKey]="colorKey()" [size]="size()" [filled]="filled()" [filledColor]="filledColor()" />`
})
class FilledAvatarHostComponent {
  public readonly colorKey = signal<string | null>(null);
  public readonly size = signal(AvatarSize.Small);
  public readonly filled = signal(true);
  public readonly filledColor = signal<AvatarColor | null>(null);
}

describe("AvatarComponent's fill", () => {
  let fixture: ComponentFixture<FilledAvatarHostComponent>;
  let host: FilledAvatarHostComponent;

  const avatar = (): HTMLElement => DomFixture.one(DomFixture.host(fixture), "nol-avatar");
  const style = (): CSSStyleDeclaration => getComputedStyle(avatar());
  const panelText = (): number => {
    const probe = document.body.appendChild(document.createElement("span"));
    probe.style.fontSize = "var(--nol-text-panel)";
    const size = parseFloat(getComputedStyle(probe).fontSize);
    probe.remove();
    return size;
  };

  async function renderAsync(theme = DefaultTheme.theme, mode = ThemeMode.Light): Promise<void> {
    AppearanceFixture.apply(theme, mode);
    fixture = TestBed.createComponent(FilledAvatarHostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  }

  async function changeAsync(change: () => void): Promise<void> {
    change();
    await fixture.whenStable();
  }

  afterEach(async () => {
    AppearanceFixture.reset();
    await ForcedColorsFixture.resetAsync();
  });

  for (const mode of AppearanceFixture.modes)
    for (const theme of AppearanceFixture.themes)
      it(`fills a borderless rounded square with each color's fill and its letter in that color's letter color, regular at the panel text size, in the ${theme.id} theme in ${mode} mode`, async () => {
        await renderAsync(theme, mode);
        const seen: unknown[] = [];
        const expected: unknown[] = [];
        for (const color of [null, ...AvatarColors.all]) {
          await changeAsync(() => host.filledColor.set(color));
          const name = color?.toLowerCase() ?? "default";
          seen.push([name, style().backgroundColor, style().color, style().borderTopStyle, style().borderTopWidth, style().fontWeight]);
          expected.push([name, AppearanceFixture.readColor(theme, mode, `avatar-${name}`), AppearanceFixture.readColor(theme, mode, `avatar-${name}-text`), "none", "0px", "400"]);
        }

        expect(seen).toEqual(expected);
        AppearanceFixture.expectLook(style().borderTopLeftRadius, theme, "radius-large", "border-top-left-radius", "border-radius");
        AppearanceFixture.expectPixels(parseFloat(style().fontSize), panelText());
        AppearanceFixture.expectLook(style().width, theme, "avatar-small", "width");
        AppearanceFixture.expectLook(style().height, theme, "avatar-small", "height");
      });

  for (const mode of AppearanceFixture.modes)
    it(`keeps each color's letter at least 4.5:1 on its fill in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      const contrasts: (readonly [string, number])[] = [];
      for (const color of [null, ...AvatarColors.all]) {
        await changeAsync(() => host.filledColor.set(color));
        contrasts.push([color ?? "default", AppearanceFixture.contrast(style().color, style().backgroundColor)]);
      }

      expect(contrasts.filter(([, contrast]) => contrast < 4.5)).toEqual([]);
    });

  it("is 1.5rem across, 24px at the default text size, with a 0.8125rem letter, 13px", async () => {
    await renderAsync();
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

    expect([avatar().getBoundingClientRect().width / rem, avatar().getBoundingClientRect().height / rem, parseFloat(style().fontSize) / rem]).toEqual([1.5, 1.5, 0.8125]);
  });

  it("takes the author color's hue its key chooses, the default pair without a key, and its bound color over its key's", async () => {
    await renderAsync();
    const fills: string[] = [];
    fills.push(avatar().style.getPropertyValue("--nol-avatar-fill"));
    await changeAsync(() => host.colorKey.set("agent-7"));
    fills.push(avatar().style.getPropertyValue("--nol-avatar-fill"));
    await changeAsync(() => host.filledColor.set(AvatarColor.Lime));
    fills.push(avatar().style.getPropertyValue("--nol-avatar-fill"), avatar().style.getPropertyValue("--nol-avatar-letter"));

    expect(fills).toEqual(["var(--nol-avatar-default)", "var(--nol-avatar-green)", "var(--nol-avatar-lime)", "var(--nol-avatar-lime-text)"]);
  });

  it("looks the same when not filled, as every avatar is filled", async () => {
    await renderAsync();
    await changeAsync(() => {
      host.filled.set(false);
      host.filledColor.set(AvatarColor.Lime);
    });

    expect([avatar().style.getPropertyValue("--nol-avatar-fill"), style().backgroundColor, style().borderTopStyle, style().fontWeight])
      .toEqual(["var(--nol-avatar-lime)", AppearanceFixture.readColor(DefaultTheme.theme, ThemeMode.Light, "avatar-lime"), "none", "400"]);
  });

  for (const mode of AppearanceFixture.modes)
    it(`keeps a 1px CanvasText edge under forced colors at the same size, in ${mode} mode`, async () => {
      await renderAsync(DefaultTheme.theme, mode);
      const before = avatar().getBoundingClientRect().width;
      await ForcedColorsFixture.activateAsync();

      expect([style().borderTopStyle, parseFloat(style().borderTopWidth), style().borderTopColor]).toEqual(["solid", AppearanceFixture.measureLook("border-width"), ForcedColorsFixture.resolve("CanvasText")]);
      AppearanceFixture.expectPixels(avatar().getBoundingClientRect().width, before);
    });
});
