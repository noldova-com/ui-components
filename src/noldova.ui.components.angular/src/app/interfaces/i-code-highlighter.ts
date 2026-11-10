/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CodeLanguage } from "../models/code-language.js";
import type { CodeToken } from "../models/code-token.js";

export interface ICodeHighlighter {
  languageNamed(name: string | null): CodeLanguage | null;
  tokens(code: string, language: CodeLanguage): readonly CodeToken[] | undefined;
  tokensAsync(code: string, language: CodeLanguage, signal: AbortSignal): Promise<readonly CodeToken[]>;
}
