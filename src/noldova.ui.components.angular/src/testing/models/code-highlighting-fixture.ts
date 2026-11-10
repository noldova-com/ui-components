/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { FactoryProvider, Injector } from "@angular/core";
import * as engine from "@shikijs/engine-javascript";
import * as shiki from "@shikijs/primitive";
import type { ShikiPrimitive } from "@shikijs/primitive";

import { CodeHighlighterTokens } from "../../app/models/code-highlighter-tokens.js";
import { CodeTokenizer } from "../../app/models/code-tokenizer.js";
import { CodeHighlighter } from "../../app/services/code-highlighter.js";

export class CodeHighlightingFixture {
  public static readonly sharedShiki: FactoryProvider = { provide: CodeHighlighterTokens.shiki, useFactory: () => CodeHighlightingFixture.shikiOf() };

  private static shared: ShikiPrimitive | null = null;

  public static isLanguageLoaded(injector: Injector, name: string): boolean {
    const highlighter = injector.get(CodeHighlighterTokens.highlighter, null);
    return highlighter instanceof CodeHighlighter && highlighter.isLoaded(name);
  }

  private static shikiOf(): ShikiPrimitive {
    CodeHighlightingFixture.shared ??= CodeTokenizer.primitiveOf(shiki, engine);
    return CodeHighlightingFixture.shared;
  }
}
