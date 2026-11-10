/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { type EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from "@angular/core";

import type { ICodeHighlightingOptions } from "../interfaces/i-code-highlighting-options.js";
import { CodeHighlighterTokens } from "../models/code-highlighter-tokens.js";
import { CodeHighlighter } from "./code-highlighter.js";

export function provideCodeHighlighting(options: ICodeHighlightingOptions = {}): EnvironmentProviders {
  const preload = [...options.preload ?? []];
  return makeEnvironmentProviders([
    { provide: CodeHighlighterTokens.highlighter, useExisting: CodeHighlighter },
    provideEnvironmentInitializer(() => inject(CodeHighlighter).preload(preload))
  ]);
}
