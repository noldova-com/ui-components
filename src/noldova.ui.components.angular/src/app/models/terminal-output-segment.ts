/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import type { TerminalOutputLine } from "./terminal-output-line.js";
import { TerminalOutputLooks } from "./terminal-output-looks.js";
import type { TerminalOutputPalette } from "./terminal-output-palette.js";
import { TerminalOutputSegmentResources } from "./terminal-output-segment.resources.js";

export class TerminalOutputSegment {
  public readonly text: string;
  public readonly style: string | null;

  public constructor(text: string, style: string | null) {
    this.text = text;
    this.style = style;
  }

  public static of(lines: readonly TerminalOutputLine[], palette: TerminalOutputPalette | null = null): readonly TerminalOutputSegment[] {
    const segments: TerminalOutputSegment[] = [];
    for (const [index, line] of lines.entries()) {
      let offset = 0;
      for (const run of line.runs) {
        segments.push(new TerminalOutputSegment(line.text.slice(offset, offset + run.length), TerminalOutputLooks.style(run, palette)));
        offset += run.length;
      }
      const next = lines[index + 1];
      const isBroken = !Object.isUndefined(next) && !next.wraps;
      const rest = line.text.slice(offset) + (isBroken ? TerminalOutputSegmentResources.terminalOutputLineBreak : String.empty);
      if (rest.length > 0)
        segments.push(new TerminalOutputSegment(rest, null));
    }
    return segments;
  }
}
