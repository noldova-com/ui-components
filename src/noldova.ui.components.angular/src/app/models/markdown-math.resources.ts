/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownMathDelimiter } from "./markdown-math-delimiter.js";

export class MarkdownMathResources {
  public static readonly markdownMathType: string = "math_inline";
  public static readonly markdownMathDisplayType: string = "math_display";
  public static readonly markdownMathBlockType: string = "math_block";
  public static readonly markdownMathTag: string = "math";
  public static readonly markdownMathDelimitersLongestFirst: readonly MarkdownMathDelimiter[] = [new MarkdownMathDelimiter("\\(", "\\)", false),
    new MarkdownMathDelimiter("\\[", "\\]", true), new MarkdownMathDelimiter("$$", "$$", true), new MarkdownMathDelimiter("$", "$", false)];
  public static readonly markdownMathBlockDelimiters: readonly MarkdownMathDelimiter[] = [new MarkdownMathDelimiter("$$", "$$", true), new MarkdownMathDelimiter("\\[", "\\]", true)];
  public static readonly markdownDollar: string = "$";
  public static readonly markdownBackslash: string = "\\";
  public static readonly markdownDigitPattern: RegExp = /\d/u;
  public static readonly markdownLineParameter: string = "line";

  public static formatMarkdownLineOutOfRange(line: number): string {
    return `The block parser has no line ${line}.`;
  }
}
