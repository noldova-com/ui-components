/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { HsvColor } from "./hsv-color.js";
import { RgbColorResources } from "./rgb-color.resources.js";

export class RgbColor {
  public readonly red: number;
  public readonly green: number;
  public readonly blue: number;

  public constructor(red: number, green: number, blue: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  public static fromHex(text: string): RgbColor | null {
    const match = RgbColorResources.hexColor.exec(text.trim());
    const digits = match?.[1];
    if (Object.isUndefined(digits))
      return null;
    const full = digits.length < 6 ? [...digits.slice(0, 3)].map(t => t + t).join(String.empty) : digits.slice(0, 6);
    return new RgbColor(Number.parseInt(full.slice(0, 2), 16), Number.parseInt(full.slice(2, 4), 16), Number.parseInt(full.slice(4, 6), 16));
  }

  public static fromHsv(color: HsvColor): RgbColor {
    const saturation = color.saturation / 100;
    const brightness = color.brightness / 100;
    const channel = (offset: number): number => {
      const step = (offset + color.hue / 60) % 6;
      return Math.round(255 * (brightness - brightness * saturation * Math.max(0, Math.min(step, 4 - step, 1))));
    };
    return new RgbColor(channel(5), channel(3), channel(1));
  }

  public static luminanceOf(red: number, green: number, blue: number): number {
    const linear = (channel: number): number => {
      const value = channel / 255;
      return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
  }

  public static contrastOf(one: number, two: number): number {
    return (Math.max(one, two) + 0.05) / (Math.min(one, two) + 0.05);
  }

  public get luminance(): number {
    return RgbColor.luminanceOf(this.red, this.green, this.blue);
  }

  public contrastWith(other: RgbColor): number {
    return RgbColor.contrastOf(this.luminance, other.luminance);
  }

  public toHsv(): HsvColor {
    const [red, green, blue] = [this.red / 255, this.green / 255, this.blue / 255];
    const highest = Math.max(red, green, blue);
    const range = highest - Math.min(red, green, blue);
    const sector = range === 0 ? 0 : highest === red ? (green - blue) / range : highest === green ? (blue - red) / range + 2 : (red - green) / range + 4;
    const hue = Math.round(sector * 60 + 360) % 360;
    return new HsvColor(hue, highest === 0 ? 0 : Math.round(range / highest * 100), Math.round(highest * 100));
  }

  public toHex(): string {
    return `#${[this.red, this.green, this.blue].map(t => t.toString(16).padStart(2, "0")).join(String.empty).toUpperCase()}`;
  }
}
