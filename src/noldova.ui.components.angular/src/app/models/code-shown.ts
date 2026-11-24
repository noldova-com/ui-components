/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CodeToken } from "./code-token.js";

export class CodeShown {
  public readonly code: string;
  public readonly tokens: readonly CodeToken[] | undefined;

  public constructor(code: string, tokens: readonly CodeToken[] | undefined) {
    this.code = code;
    this.tokens = tokens;
  }
}
