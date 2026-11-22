/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ColorPickerShadeStep } from "../../models/color-picker-shade-step.js";

export class ColorPickerResources {
  public static readonly colorPickerShadeLabel: string = "Saturation and brightness";
  public static readonly colorPickerHueLabel: string = "Hue";
  public static readonly colorPickerHexLabel: string = "Hex";
  public static readonly colorPickerHexPrefix: string = "#";
  public static readonly colorPickerFieldReference: string = "field";
  public static readonly colorPickerMaximumHue: number = 359;
  public static readonly colorPickerMaximumShade: number = 100;
  public static readonly colorPickerLargeStep: number = 10;
  public static readonly colorPickerShadeKeys: ReadonlyMap<string, ColorPickerShadeStep> = new Map<string, ColorPickerShadeStep>([
    ["ArrowLeft", new ColorPickerShadeStep(-1, 0)],
    ["ArrowRight", new ColorPickerShadeStep(1, 0)],
    ["ArrowUp", new ColorPickerShadeStep(0, 1)],
    ["ArrowDown", new ColorPickerShadeStep(0, -1)],
    ["PageUp", new ColorPickerShadeStep(0, 10)],
    ["PageDown", new ColorPickerShadeStep(0, -10)],
    ["Home", new ColorPickerShadeStep(-100, 0)],
    ["End", new ColorPickerShadeStep(100, 0)]
  ]);
  public static readonly colorPickerHueKeys: ReadonlyMap<string, number> = new Map<string, number>([
    ["ArrowLeft", -1],
    ["ArrowDown", -1],
    ["ArrowRight", 1],
    ["ArrowUp", 1],
    ["PageDown", -10],
    ["PageUp", 10],
    ["Home", -359],
    ["End", 359]
  ]);

  public static formatShade(saturation: number, brightness: number): string {
    return `Saturation ${saturation}%, brightness ${brightness}%`;
  }

  public static formatHue(hue: number): string {
    return `${hue} degrees`;
  }

  public static formatOriginal(hex: string): string {
    return `Back to the original color, ${hex}`;
  }
}
