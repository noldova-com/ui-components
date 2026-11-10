/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken } from "@angular/core";
import type { ShikiPrimitive } from "@shikijs/primitive";

import type { ICodeHighlighter } from "../interfaces/i-code-highlighter.js";
import type { ICodeWorker } from "../interfaces/i-code-worker.js";
import { CodeHighlighterTokensResources } from "./code-highlighter-tokens.resources.js";

export class CodeHighlighterTokens {
  public static readonly tokenizeTimeLimit: InjectionToken<number> =
    new InjectionToken<number>(CodeHighlighterTokensResources.codeTokenizeTimeLimitToken, { providedIn: "root", factory: () => CodeHighlighterTokensResources.codeTokenizeTimeLimit });
  public static readonly tokensKeptLength: InjectionToken<number> =
    new InjectionToken<number>(CodeHighlighterTokensResources.codeTokensKeptLengthToken, { providedIn: "root", factory: () => CodeHighlighterTokensResources.codeTokensKeptLength });
  public static readonly highlighter: InjectionToken<ICodeHighlighter | null> =
    new InjectionToken<ICodeHighlighter | null>(CodeHighlighterTokensResources.codeHighlighterToken, { providedIn: "root", factory: () => null });
  public static readonly worker: InjectionToken<(() => ICodeWorker) | null> =
    new InjectionToken<(() => ICodeWorker) | null>(CodeHighlighterTokensResources.codeHighlightingWorkerToken, { providedIn: "root", factory: () => null });
  public static readonly shiki: InjectionToken<ShikiPrimitive | null> =
    new InjectionToken<ShikiPrimitive | null>(CodeHighlighterTokensResources.codeShikiToken, { providedIn: "root", factory: () => null });
}
