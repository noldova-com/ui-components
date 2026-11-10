/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TerminalOutputColorResources {
  public static readonly terminalOutputLiftStep: number = 0.1;
  public static readonly terminalOutputComputedColor: RegExp = /^rgba?\((\d+), (\d+), (\d+)(?:, [\d.]+)?\)$/;
}
