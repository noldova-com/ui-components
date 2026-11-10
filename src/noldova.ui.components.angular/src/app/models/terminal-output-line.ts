/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { TerminalOutputLineResources } from "./terminal-output-line.resources.js";
import type { TerminalOutputRun } from "./terminal-output-run.js";

export class TerminalOutputLine {
  public readonly text: string;
  public readonly wraps: boolean;
  public readonly runs: readonly TerminalOutputRun[];

  public constructor(text: string, wraps: boolean = false, runs: readonly TerminalOutputRun[] = []) {
    const length = runs.reduce((total, t) => total + t.length, 0);
    if (length > text.length)
      throw new ArgumentOutOfRangeException(TerminalOutputLineResources.terminalOutputRunsParameter, length, TerminalOutputLineResources.formatTerminalOutputRunsOutOfRange(length, text.length));

    this.text = text;
    this.wraps = wraps;
    this.runs = Object.freeze([...runs]);
  }
}
