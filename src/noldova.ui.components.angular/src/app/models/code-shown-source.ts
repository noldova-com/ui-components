/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CodeToken } from "./code-token.js";

// What a code block's shown code follows: its code, the tokens it has for that code, if any, and whether more are loading.
export class CodeShownSource {
  public readonly code: string;
  public readonly tokens: readonly CodeToken[] | undefined;
  public readonly isLoading: boolean;

  public constructor(code: string, tokens: readonly CodeToken[] | undefined, isLoading: boolean) {
    this.code = code;
    this.tokens = tokens;
    this.isLoading = isLoading;
  }
}
