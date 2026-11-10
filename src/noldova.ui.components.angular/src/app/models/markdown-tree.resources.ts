/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MarkdownNodeKind } from "../enums/markdown-node-kind.js";

export class MarkdownTreeResources {
  public static readonly markdownFinalLineBreakPattern: RegExp = /\n$/u;
  public static readonly markdownSpacePattern: RegExp = /\s+/u;
  public static readonly markdownSourceAttribute: string = "src";
  public static readonly markdownTitleAttribute: string = "title";
  public static readonly markdownBreakTypes: ReadonlySet<string> = new Set(["softbreak", "hardbreak"]);
  public static readonly markdownSpecialTextType: string = "text_special";
  public static readonly markdownEscapeInfo: string = "escape";
  public static readonly markdownLeafKinds: ReadonlyMap<string, MarkdownNodeKind> = new Map([
    ["softbreak", MarkdownNodeKind.SoftBreak],
    ["hardbreak", MarkdownNodeKind.HardBreak],
    ["code_inline", MarkdownNodeKind.InlineCode],
    ["fence", MarkdownNodeKind.Code],
    ["code_block", MarkdownNodeKind.Code],
    ["hr", MarkdownNodeKind.Rule],
    ["image", MarkdownNodeKind.Image],
    ["math_inline", MarkdownNodeKind.Math],
    ["math_display", MarkdownNodeKind.MathDisplay],
    ["math_block", MarkdownNodeKind.MathDisplay]
  ]);
}
