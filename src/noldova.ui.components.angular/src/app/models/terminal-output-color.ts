/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { RgbColor } from "./rgb-color.js";
import { TerminalOutputColorResources } from "./terminal-output-color.resources.js";

export class TerminalOutputColor {
  public readonly red: number;
  public readonly green: number;
  public readonly blue: number;

  public constructor(red: number, green: number, blue: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
  }

  public static parse(css: string): TerminalOutputColor | null {
    const match = TerminalOutputColorResources.terminalOutputComputedColor.exec(css);
    return Object.isNull(match) ? null : new TerminalOutputColor(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  public get luminance(): number {
    return RgbColor.luminanceOf(this.red, this.green, this.blue);
  }

  public contrastWith(other: TerminalOutputColor): number {
    return RgbColor.contrastOf(this.luminance, other.luminance);
  }

  public over(other: TerminalOutputColor, share: number): TerminalOutputColor {
    const mix = (top: number, bottom: number): number => Math.round(top * share + bottom * (1 - share));
    return new TerminalOutputColor(mix(this.red, other.red), mix(this.green, other.green), mix(this.blue, other.blue));
  }

  public lift(background: TerminalOutputColor, ratio: number): TerminalOutputColor {
    if (this.contrastWith(background) >= ratio)
      return this;
    const isDarker = this.luminance < background.luminance;
    const first = isDarker ? TerminalOutputColor.darken(this, background, ratio) : TerminalOutputColor.lighten(this, background, ratio);
    if (first.contrastWith(background) >= ratio)
      return first;
    return isDarker ? TerminalOutputColor.lighten(this, background, ratio) : TerminalOutputColor.darken(this, background, ratio);
  }

  public toCss(): string {
    return `#${[this.red, this.green, this.blue].map(t => t.toString(16).padStart(2, "0")).join(String.empty)}`;
  }

  private static darken(from: TerminalOutputColor, background: TerminalOutputColor, ratio: number): TerminalOutputColor {
    let color = from;
    while (color.contrastWith(background) < ratio && (color.red > 0 || color.green > 0 || color.blue > 0)) {
      const step = (channel: number): number => channel - Math.ceil(channel * TerminalOutputColorResources.terminalOutputLiftStep);
      color = new TerminalOutputColor(step(color.red), step(color.green), step(color.blue));
    }
    return color;
  }

  private static lighten(from: TerminalOutputColor, background: TerminalOutputColor, ratio: number): TerminalOutputColor {
    let color = from;
    while (color.contrastWith(background) < ratio && (color.red < 255 || color.green < 255 || color.blue < 255)) {
      const step = (channel: number): number => channel + Math.ceil((255 - channel) * TerminalOutputColorResources.terminalOutputLiftStep);
      color = new TerminalOutputColor(step(color.red), step(color.green), step(color.blue));
    }
    return color;
  }
}
