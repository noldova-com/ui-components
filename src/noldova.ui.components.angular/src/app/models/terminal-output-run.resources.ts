/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TerminalOutputRunResources {
  public static readonly terminalOutputLengthParameter: string = "length";
  public static readonly terminalOutputForegroundParameter: string = "foreground";
  public static readonly terminalOutputBackgroundParameter: string = "background";
  public static readonly terminalOutputStyleParameter: string = "style";
  public static readonly terminalOutputRedParameter: string = "red";
  public static readonly terminalOutputGreenParameter: string = "green";
  public static readonly terminalOutputBlueParameter: string = "blue";
  public static readonly terminalOutputRgbMaximum: number = 0xffffff;
  public static readonly terminalOutputChannelMaximum: number = 255;
  public static readonly terminalOutputStyles: number = 0b111101111;
  public static formatTerminalOutputLengthOutOfRange(length: number): string {
    return `A run's length must be a whole number from 1; ${String(length)} is not.`;
  }
  public static formatTerminalOutputColorOutOfRange(color: number): string {
    return `A run's color must be the default, -1, a palette index from 0 to 255, or an RGB color from TerminalOutputRun.rgb; ${String(color)} is none.`;
  }
  public static formatTerminalOutputStyleOutOfRange(style: number): string {
    return `A run's style must add up TerminalOutputStyle's flags; ${String(style)} does not.`;
  }
  public static formatTerminalOutputChannelOutOfRange(value: number): string {
    return `A color channel must be a whole number from 0 to 255; ${String(value)} is not.`;
  }
}
