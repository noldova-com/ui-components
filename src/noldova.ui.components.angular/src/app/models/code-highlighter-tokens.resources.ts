/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class CodeHighlighterTokensResources {
  public static readonly codeTokenizeTimeLimit: number = 500;
  public static readonly codeTokenizeTimeLimitToken: string = "nol-code-tokenize-time-limit";
  public static readonly codeTokensKeptLengthToken: string = "nol-code-tokens-kept-length";
  public static readonly codeHighlighterToken: string = "nol-code-highlighter";
  public static readonly codeTokensKeptLength: number = 1_000_000;
  public static readonly codeHighlightingWorkerToken: string = "nol-code-highlighting-worker";
  public static readonly codeShikiToken: string = "nol-code-shiki";
}
