/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ColorSwatch } from "../../enums/color-swatch.js";
import { ThemeMode } from "../../enums/theme-mode.js";

export class ColorChooserResources {
  public static readonly colorChooserItemSelector: string = ".nol-color-chooser-item";
  public static readonly colorChooserNoneLabel: string = "None";
  public static readonly colorChooserCustomLabel: string = "Custom color";
  public static readonly colorChooserPickerLabel: string = "Custom color";
  public static readonly colorChooserCustomGlyph: string = "palette";
  public static readonly colorChooserNoneGlyph: string = "block";
  public static readonly colorChooserIdPrefix: string = "nol-color-chooser-";
  public static readonly colorChooserWarningSuffix: string = "-warning";
  public static readonly colorChooserPickerSuffix: string = "-picker";
  public static readonly colorChooserSeed: string = "#2F78CA";
  public static readonly colorChooserTargets: ReadonlyMap<string, (current: number, last: number) => number> = new Map<string, (current: number, last: number) => number>([
    ["ArrowRight", (current, last) => current >= last ? 0 : current + 1],
    ["ArrowDown", (current, last) => current >= last ? 0 : current + 1],
    ["ArrowLeft", (current, last) => current <= 0 ? last : current - 1],
    ["ArrowUp", (current, last) => current <= 0 ? last : current - 1],
    ["Home", () => 0],
    ["End", (_current, last) => last]
  ]);

  public static nameSwatch(swatch: ColorSwatch): string {
    switch (swatch) {
      case ColorSwatch.Blue:
        return "Blue";
      case ColorSwatch.Teal:
        return "Teal";
      case ColorSwatch.Green:
        return "Green";
      case ColorSwatch.Amber:
        return "Amber";
      case ColorSwatch.Orange:
        return "Orange";
      case ColorSwatch.Red:
        return "Red";
      case ColorSwatch.Magenta:
        return "Magenta";
      case ColorSwatch.Purple:
        return "Purple";
    }
  }

  public static formatContrastWarning(modes: readonly ThemeMode[]): string {
    const where = modes.length > 1 ? "the light and dark themes" : modes.includes(ThemeMode.Dark) ? "the dark theme" : "the light theme";
    return `Low contrast in ${where}: this color may be hard to see on some surfaces.`;
  }
}
