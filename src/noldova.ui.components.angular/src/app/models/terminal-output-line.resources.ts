/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TerminalOutputLineResources {
  public static readonly terminalOutputRunsParameter: string = "runs";
  public static formatTerminalOutputRunsOutOfRange(length: number, textLength: number): string {
    return `A line's runs cover ${String(length)} characters, past its text's ${String(textLength)}.`;
  }
}
