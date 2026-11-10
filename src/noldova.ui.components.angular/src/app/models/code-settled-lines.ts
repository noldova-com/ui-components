/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { GrammarState } from "@shikijs/primitive/types";

import type { CodeToken } from "./code-token.js";
import { Resources } from "../../resources.js";

export class CodeSettledLines {
  public readonly languageId: string;
  public readonly code: string;
  public readonly tokens: readonly CodeToken[];
  public readonly state: GrammarState | undefined;

  public constructor(languageId: string, code: string, tokens: readonly CodeToken[], state: GrammarState | undefined) {
    this.languageId = languageId;
    this.code = code;
    this.tokens = tokens;
    this.state = state;
  }

  public isContinuedBy(code: string, languageId: string): boolean {
    return languageId === this.languageId && code[this.code.length] === Resources.codeLineBreak && code.startsWith(this.code);
  }
}
