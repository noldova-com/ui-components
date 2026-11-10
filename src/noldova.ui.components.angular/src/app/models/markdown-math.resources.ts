/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownMathResources {
  public static readonly markdownMathType: string = "math_inline";
  public static readonly markdownMathDisplayType: string = "math_display";
  public static readonly markdownMathBlockType: string = "math_block";
  public static readonly markdownMathTag: string = "math";
  public static readonly markdownMathDelimitersLongestFirst: readonly (readonly [string, string, boolean])[] = [["\\(", "\\)", false], ["\\[", "\\]", true], ["$$", "$$", true],
    ["$", "$", false]];
  public static readonly markdownMathBlockDelimiters: readonly (readonly [string, string])[] = [["$$", "$$"], ["\\[", "\\]"]];
  public static readonly markdownDollar: string = "$";
  public static readonly markdownBackslash: string = "\\";
  public static readonly markdownDigitPattern: RegExp = /\d/u;
}
