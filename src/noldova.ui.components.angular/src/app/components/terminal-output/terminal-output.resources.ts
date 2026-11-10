/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TerminalOutputResources {
  public static readonly terminalOutputRowSample: string = "W";
  public static readonly terminalOutputLineHeightToken: string = "--nol-line-terminal";
  public static readonly terminalOutputThemeAttributes: readonly string[] = ["style", "class"];
  public static readonly terminalOutputSampleBox: ResizeObserverBoxOptions = "device-pixel-content-box";
  public static readonly terminalOutputFollowDistance: number = 16;
}
