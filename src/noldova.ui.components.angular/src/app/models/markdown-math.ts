/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { StateBlock, StateInline } from "markdown-it";

import "@noldova/context.core";
import { ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { Resources } from "../../resources.js";
import { MarkdownMathScan } from "./markdown-math-scan.js";
import { MarkdownMathResources } from "./markdown-math.resources.js";

export class MarkdownMath {
  public static inline(state: StateInline, silent: boolean): boolean {
    if (state.env[Resources.markdownMathKey] === false)
      return false;
    const delimiter = MarkdownMathResources.markdownMathDelimitersLongestFirst.find(t => state.src.startsWith(t.open, state.pos));
    if (Object.isUndefined(delimiter))
      return false;
    const scan = MarkdownMathScan.of(state);
    const end = delimiter.open === MarkdownMathResources.markdownDollar ? scan.dollarEnd(state.pos + 1) : scan.closingEnd(state.pos + delimiter.open.length, delimiter.close);
    if (end < 0)
      return false;
    if (!silent) {
      const token = state.push(delimiter.isDisplay ? MarkdownMathResources.markdownMathDisplayType : MarkdownMathResources.markdownMathType, MarkdownMathResources.markdownMathTag, 0);
      token.markup = delimiter.open;
      token.content = state.src.slice(state.pos + delimiter.open.length, end - delimiter.close.length);
      token.info = state.src.slice(state.pos, end);
    }
    state.pos = end;
    return true;
  }

  public static block(state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean {
    if (state.env[Resources.markdownMathKey] === false)
      return false;
    const first = MarkdownMath.lineOf(state, startLine);
    const delimiter = MarkdownMathResources.markdownMathBlockDelimiters.find(t => first.startsWith(t.open));
    if (Object.isUndefined(delimiter))
      return false;
    const { open, close } = delimiter;
    const lines = [first];
    for (let line = startLine; line < endLine; line++) {
      const text = line === startLine ? first : MarkdownMath.lineOf(state, line);
      if (line > startLine) {
        if (state.isEmpty(line) || MarkdownMath.indentOf(state, line) < state.blkIndent)
          return false;
        lines.push(text);
      }
      const from = line === startLine ? open.length : 0;
      const at = text.indexOf(close, from);
      if (at < 0)
        continue;
      if (at + close.length !== text.length || (line === startLine && at === from))
        return false;
      if (silent)
        return true;
      const source = lines.join(Resources.markdownLineBreak);
      const token = state.push(MarkdownMathResources.markdownMathBlockType, MarkdownMathResources.markdownMathTag, 0);
      token.block = true;
      token.markup = open;
      token.content = source.slice(open.length, -close.length);
      token.info = source;
      token.map = [startLine, line + 1];
      state.line = line + 1;
      return true;
    }
    return false;
  }

  private static indentOf(state: StateBlock, line: number): number {
    return MarkdownMath.entryOf(state.sCount, line);
  }

  private static lineOf(state: StateBlock, line: number): string {
    const start = MarkdownMath.entryOf(state.bMarks, line) + MarkdownMath.entryOf(state.tShift, line);
    return state.src.slice(start, MarkdownMath.entryOf(state.eMarks, line)).trimEnd();
  }

  private static entryOf(entries: readonly number[], line: number): number {
    const entry = entries[line];
    if (Object.isUndefined(entry))
      throw new ArgumentOutOfRangeException(MarkdownMathResources.markdownLineParameter, line, MarkdownMathResources.formatMarkdownLineOutOfRange(line));
    return entry;
  }
}
