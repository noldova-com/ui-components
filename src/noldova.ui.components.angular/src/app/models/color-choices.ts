/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { DomResources } from "../../dom-resources.js";
import { ColorSwatch } from "../enums/color-swatch.js";
import { ThemeMode } from "../enums/theme-mode.js";
import { ColorChoicesResources } from "./color-choices.resources.js";
import { ColorToken } from "./color-token.js";
import { RgbColor } from "./rgb-color.js";
import type { Theme } from "./theme.js";

export class ColorChoices {
  public static readonly swatches: readonly ColorSwatch[] = [ColorSwatch.Blue, ColorSwatch.Teal, ColorSwatch.Green, ColorSwatch.Amber, ColorSwatch.Orange,
    ColorSwatch.Red, ColorSwatch.Magenta, ColorSwatch.Purple];

  public static isSwatch(value: string | null): value is ColorSwatch {
    return ColorChoices.swatches.some(t => t === value);
  }

  public static readCustom(value: string | null): string | null {
    const color = Object.isNull(value) || !ColorChoicesResources.customColor.test(value) ? null : RgbColor.fromHex(value);
    return color?.toHex() ?? null;
  }

  public static toCss(value: string | null): string | null {
    if (ColorChoices.isSwatch(value))
      return `var(${ColorChoicesResources.swatchVariablePrefix}${value})`;
    return ColorChoices.readCustom(value);
  }

  public static resolve(value: string | null, theme: Theme, mode: ThemeMode): string | null {
    if (!ColorChoices.isSwatch(value))
      return ColorChoices.readCustom(value);
    return ColorChoices.readColor(ColorChoices.swatchToken(value).resolve(theme, mode))?.toHex() ?? null;
  }

  public static lowContrastModes(value: string | null, theme: Theme): readonly ThemeMode[] {
    const custom = ColorChoices.readCustom(value);
    const color = Object.isNull(custom) ? null : RgbColor.fromHex(custom);
    if (Object.isNull(color))
      return [];
    const surfaces = DomResources.colorTokens.filter(t => ColorChoicesResources.contrastSurfaceKeys.includes(t.key));
    return [ThemeMode.Light, ThemeMode.Dark].filter(mode => surfaces.some(token => {
      const surface = ColorChoices.readColor(token.resolve(theme, mode));
      return !Object.isNull(surface) && color.contrastWith(surface) < ColorChoicesResources.minimumContrast;
    }));
  }

  private static swatchToken(swatch: ColorSwatch): ColorToken {
    return new ColorToken(`${ColorChoicesResources.swatchVariablePrefix}${swatch}`, `${ColorChoicesResources.swatchKeyPrefix}${swatch}`,
      `${ColorChoicesResources.authorKeyPrefix}${ColorChoices.swatches.indexOf(swatch) + 1}`);
  }

  private static readColor(color: string | undefined): RgbColor | null {
    return Object.isUndefined(color) || !ColorChoicesResources.opaqueColor.test(color) ? null : RgbColor.fromHex(color);
  }
}
