/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownParserResources {
  public static readonly markdownStripDefinitionsRule: string = "strip_references";
  public static readonly markdownJoinTextRule: string = "text_join";
  public static readonly markdownNormalizeRule: string = "normalize";
  public static readonly markdownLinkSchemesRule: string = "link_schemes";
  public static readonly markdownTextReferencesRule: string = "text_references";
  public static readonly markdownTextLinesRule: string = "text_lines";
  public static readonly markdownTextLinesEndRule: string = "text_lines_end";
  public static readonly markdownTextRule: string = "text";
  public static readonly markdownBalancePairsRule: string = "balance_pairs";
  public static readonly markdownLinkifyRule: string = "linkify";
  public static readonly markdownImageRule: string = "image";
  public static readonly markdownEscapeRule: string = "escape";
  public static readonly markdownFenceRule: string = "fence";
  public static readonly markdownMathRule: string = "math";
  public static readonly markdownMathBlockRule: string = "math_block";
  public static readonly markdownMathBlockAlternatives: readonly string[] = ["paragraph", "reference", "blockquote", "list"];
  public static readonly markdownFenceAlternatives: readonly string[] = ["paragraph", "reference", "blockquote", "list"];
}
