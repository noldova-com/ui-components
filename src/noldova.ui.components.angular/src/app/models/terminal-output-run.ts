/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { Resources } from "../../resources.js";
import { TerminalOutputRunResources } from "./terminal-output-run.resources.js";

export class TerminalOutputRun {
  public static readonly defaultColor: number = -1;
  public static readonly rgbOffset: number = 0x1000000;

  public readonly length: number;
  public readonly foreground: number;
  public readonly background: number;
  public readonly style: number;

  public constructor(length: number, foreground: number = TerminalOutputRun.defaultColor, background: number = TerminalOutputRun.defaultColor, style: number = 0) {
    if (!Number.isSafeInteger(length) || length < 1)
      throw new ArgumentOutOfRangeException(TerminalOutputRunResources.terminalOutputLengthParameter, length, TerminalOutputRunResources.formatTerminalOutputLengthOutOfRange(length));
    TerminalOutputRun.throwIfNoColor(foreground, TerminalOutputRunResources.terminalOutputForegroundParameter);
    TerminalOutputRun.throwIfNoColor(background, TerminalOutputRunResources.terminalOutputBackgroundParameter);
    if (!Number.isSafeInteger(style) || style < 0 || (style & ~TerminalOutputRunResources.terminalOutputStyles) !== 0)
      throw new ArgumentOutOfRangeException(TerminalOutputRunResources.terminalOutputStyleParameter, style, TerminalOutputRunResources.formatTerminalOutputStyleOutOfRange(style));

    this.length = length;
    this.foreground = foreground;
    this.background = background;
    this.style = style;
  }

  public static rgb(red: number, green: number, blue: number): number {
    TerminalOutputRun.throwIfNoChannel(red, TerminalOutputRunResources.terminalOutputRedParameter);
    TerminalOutputRun.throwIfNoChannel(green, TerminalOutputRunResources.terminalOutputGreenParameter);
    TerminalOutputRun.throwIfNoChannel(blue, TerminalOutputRunResources.terminalOutputBlueParameter);
    return TerminalOutputRun.rgbOffset + (red << 16) + (green << 8) + blue;
  }

  private static throwIfNoChannel(value: number, name: string): void {
    if (!Number.isSafeInteger(value) || value < 0 || value > TerminalOutputRunResources.terminalOutputChannelMaximum)
      throw new ArgumentOutOfRangeException(name, value, TerminalOutputRunResources.formatTerminalOutputChannelOutOfRange(value));
  }

  private static throwIfNoColor(color: number, name: string): void {
    if (!Number.isSafeInteger(color) || color < TerminalOutputRun.defaultColor || color > TerminalOutputRun.rgbOffset + TerminalOutputRunResources.terminalOutputRgbMaximum
      || (color >= Resources.terminalOutputPaletteSize && color < TerminalOutputRun.rgbOffset))
      throw new ArgumentOutOfRangeException(name, color, TerminalOutputRunResources.formatTerminalOutputColorOutOfRange(color));
  }
}
