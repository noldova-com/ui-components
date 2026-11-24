/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ICodeHighlighter } from "../interfaces/i-code-highlighter.js";
import type { CodeLanguage } from "./code-language.js";

export class CodeTokensRequest {
  public readonly code: string;
  public readonly language: CodeLanguage;
  public readonly highlighter: ICodeHighlighter;

  public constructor(code: string, language: CodeLanguage, highlighter: ICodeHighlighter) {
    this.code = code;
    this.language = language;
    this.highlighter = highlighter;
  }
}
