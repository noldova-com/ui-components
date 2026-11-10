/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownTailResources {
  public static readonly markdownHeldTailLimit: number = 300;
  public static readonly markdownTailScanLimit: number = 600;
  public static readonly markdownCodeSpanPattern: RegExp = /(`+)[\s\S]*?\1/gu;
  public static readonly markdownMathSpanPattern: RegExp = /\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]|\$\$[\s\S]+?\$\$|\$[^\s$](?:[^$]*?[^\s\\$])?\$(?!\d)/gu;
  public static readonly markdownFenceOpenPattern: RegExp = /^ {0,3}(`{3,}|~{3,})/u;
  public static readonly markdownFenceMarkPattern: RegExp = /^ {0,3}(`+|~+)\s*$/u;
  public static readonly markdownBlockMarkerPattern: RegExp = /^ {0,3}(?:[-*+]|#{1,6}|>+|\d{1,9}[.)])$/u;
  public static readonly markdownTableRowPattern: RegExp = /^ {0,3}\|/u;
  public static readonly markdownDelimiterCellPattern: RegExp = /^\s*:?-+:?\s*$/u;
  public static readonly markdownTableEdge: string = "|";
  public static readonly markdownUnderscore: string = "_";
  public static readonly markdownLinkStart: string = "[";
  public static readonly markdownLinkEnd: string = "]";
  public static readonly markdownDestinationStart: string = "(";
  public static readonly markdownDestinationEnd: string = ")";
  public static readonly markdownEscape: string = "\\";
  public static readonly markdownTilde: string = "~";
  public static readonly markdownEmphasisMarks: readonly string[] = ["*", "_", "~"];
  public static readonly markdownImageStart: string = "!";
  public static readonly markdownAutolinkStart: string = "<";
  public static readonly markdownAutolinkEnd: string = ">";
}
