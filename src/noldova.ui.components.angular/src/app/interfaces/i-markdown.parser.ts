/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { MarkdownIt } from "markdown-it";

export interface IMarkdownParser {
  parser(): MarkdownIt | undefined;
  parserAsync(): Promise<MarkdownIt | null>;
}
