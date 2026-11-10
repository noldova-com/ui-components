/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { StateBlock, StateInline } from "markdown-it";

import "@noldova/context.core";

import { Resources } from "../../resources.js";
import { MarkdownMathResources } from "./markdown-math.resources.js";

export class MarkdownMath {
  public static inline(state: StateInline, silent: boolean): boolean {
    if (state.env[Resources.markdownMathKey] === false)
      return false;
    const delimiters = MarkdownMathResources.markdownMathDelimitersLongestFirst.find(([open]) => state.src.startsWith(open, state.pos));
    if (Object.isUndefined(delimiters))
      return false;
    const [open, close, isDisplay] = delimiters;
    const end = open === MarkdownMathResources.markdownDollar ? MarkdownMath.dollarEnd(state.src, state.pos + 1) : MarkdownMath.closingEnd(state.src, state.pos + open.length, close);
    if (end < 0)
      return false;
    if (!silent) {
      const token = state.push(isDisplay ? MarkdownMathResources.markdownMathDisplayType : MarkdownMathResources.markdownMathType, MarkdownMathResources.markdownMathTag, 0);
      token.markup = open;
      token.content = state.src.slice(state.pos + open.length, end - close.length);
      token.info = state.src.slice(state.pos, end);
    }
    state.pos = end;
    return true;
  }

  public static block(state: StateBlock, startLine: number, endLine: number, silent: boolean): boolean {
    if (state.env[Resources.markdownMathKey] === false)
      return false;
    const first = MarkdownMath.lineOf(state, startLine);
    const delimiters = MarkdownMathResources.markdownMathBlockDelimiters.find(([open]) => first.startsWith(open));
    if (Object.isUndefined(delimiters))
      return false;
    const [open, close] = delimiters;
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

  private static closingEnd(source: string, start: number, close: string): number {
    const at = source.indexOf(close, start);
    return at < 0 || String.isNullOrWhitespace(source.slice(start, at)) ? -1 : at + close.length;
  }

  private static dollarEnd(source: string, start: number): number {
    const isPaired = source.charAt(start) === MarkdownMathResources.markdownDollar || source.charAt(start - 2) === MarkdownMathResources.markdownDollar;
    if (Resources.markdownWhitespacePattern.test(source.charAt(start)) || isPaired)
      return -1;
    for (let at = source.indexOf(MarkdownMathResources.markdownDollar, start + 1); at >= 0; at = source.indexOf(MarkdownMathResources.markdownDollar, at + 1)) {
      const before = source.charAt(at - 1);
      if (!Resources.markdownWhitespacePattern.test(before) && before !== MarkdownMathResources.markdownBackslash && !MarkdownMathResources.markdownDigitPattern.test(source.charAt(at + 1)))
        return at + 1;
    }
    return -1;
  }

  private static indentOf(state: StateBlock, line: number): number {
    return state.sCount[line] as number;
  }

  private static lineOf(state: StateBlock, line: number): string {
    return state.src.slice((state.bMarks[line] as number) + (state.tShift[line] as number), state.eMarks[line]).trimEnd();
  }
}
