/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ShikiPrimitive } from "@shikijs/primitive";
import type { CodeToTokensBaseOptions, GrammarState, LanguageInput, ThemeRegistrationRaw, ThemedToken } from "@shikijs/primitive/types";

import "@noldova/context.core";

import { CodeTokenKind } from "../enums/code-token-kind.js";
import { CodeSettledLines } from "./code-settled-lines.js";
import { CodeToken } from "./code-token.js";
import { Resources } from "../../resources.js";
import { CodeTokenizerResources } from "./code-tokenizer.resources.js";

export class CodeTokenizer {
  private static readonly kindsByMarker: ReadonlyMap<string | undefined, CodeTokenKind> =
    new Map(Object.values(CodeTokenKind).map((t): [string, CodeTokenKind] => [CodeTokenizer.markerOf(t), t]));
  private static readonly theme: ThemeRegistrationRaw = {
    name: Resources.codeThemeName,
    fg: CodeTokenizerResources.codePlainMarker,
    bg: CodeTokenizerResources.codePlainMarker,
    settings: [
      { settings: { foreground: CodeTokenizerResources.codePlainMarker } },
      ...Object.values(CodeTokenKind).map(t => ({ scope: [...CodeTokenizerResources.codeTokenScopes[t]], settings: { foreground: CodeTokenizer.markerOf(t) } })),
      { scope: [...CodeTokenizerResources.codePlainScopes], settings: { foreground: CodeTokenizerResources.codePlainMarker } }
    ]
  };

  private readonly shiki: typeof import("@shikijs/primitive");
  private readonly primitive: ShikiPrimitive;
  private readonly settled: CodeSettledLines[] = [];

  public constructor(shiki: typeof import("@shikijs/primitive"), primitive: ShikiPrimitive) {
    this.shiki = shiki;
    this.primitive = primitive;
  }

  public static primitiveOf(shiki: typeof import("@shikijs/primitive"), engine: typeof import("@shikijs/engine-javascript")): ShikiPrimitive {
    return shiki.createShikiPrimitive({ engine: engine.createJavaScriptRegexEngine({ forgiving: true }), themes: [CodeTokenizer.theme] });
  }

  public async loadAsync(grammar: LanguageInput): Promise<void> {
    await this.primitive.loadLanguage(grammar);
  }

  public warm(languageId: string): void {
    this.shiki.codeToTokensBase(this.primitive, CodeTokenizerResources.codeWarmingSample,
      { lang: languageId, theme: Resources.codeThemeName, tokenizeTimeLimit: Resources.codeNoTokenizeTimeLimit });
  }

  public tokenize(code: string, languageId: string, timeLimit: number): readonly CodeToken[] {
    const options = { lang: languageId, theme: Resources.codeThemeName, tokenizeMaxLineLength: CodeTokenizerResources.codeLineLengthLimit + 1, tokenizeTimeLimit: timeLimit };
    if (code.includes(CodeTokenizerResources.codeCarriageReturn))
      return CodeTokenizer.tokensOf(this.shiki.codeToTokensBase(this.primitive, code, options), 0);
    const settled = this.settled.find(t => t.isContinuedBy(code, languageId));
    let start = Object.isUndefined(settled) ? 0 : settled.code.length + Resources.codeLineBreak.length;
    let tokens = settled?.tokens ?? [];
    let state: GrammarState | undefined = settled?.state;
    const end = code.lastIndexOf(Resources.codeLineBreak);
    if (end >= start) {
      const began = Date.now();
      const lines = this.shiki.codeToTokensBase(this.primitive, code.slice(start, end), CodeTokenizer.optionsFrom(options, state));
      tokens = [...tokens, ...CodeTokenizer.tokensOf(lines, start)];
      state = this.shiki.getLastGrammarState(this.primitive, lines);
      if (timeLimit === Resources.codeNoTokenizeTimeLimit || Date.now() - began <= timeLimit)
        this.settle(new CodeSettledLines(languageId, code.slice(0, end), tokens, state), settled);
      start = end + Resources.codeLineBreak.length;
    }
    if (start >= code.length)
      return tokens;
    return [...tokens, ...CodeTokenizer.tokensOf(this.shiki.codeToTokensBase(this.primitive, code.slice(start), CodeTokenizer.optionsFrom(options, state)), start)];
  }

  public dispose(): void {
    this.primitive.dispose();
  }

  private static markerOf(kind: CodeTokenKind): string {
    return kind.toLowerCase();
  }

  private static optionsFrom(options: CodeToTokensBaseOptions, state: GrammarState | undefined): CodeToTokensBaseOptions {
    return Object.isUndefined(state) ? options : { ...options, grammarState: state };
  }

  private static tokensOf(lines: readonly ThemedToken[][], start: number): readonly CodeToken[] {
    return lines.flat().flatMap(t => {
      const kind = CodeTokenizer.kindsByMarker.get(t.color);
      return Object.isUndefined(kind) ? [] : [new CodeToken(start + t.offset, t.content, kind)];
    });
  }

  private settle(lines: CodeSettledLines, replaced: CodeSettledLines | undefined): void {
    const index = Object.isUndefined(replaced) ? -1 : this.settled.indexOf(replaced);
    if (index >= 0)
      this.settled.splice(index, 1);
    this.settled.unshift(lines);
    this.settled.length = Math.min(this.settled.length, CodeTokenizerResources.codeSettledLinesKept);
  }
}
