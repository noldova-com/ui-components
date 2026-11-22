/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Token } from "markdown-it";

import { MarkdownTextRange } from "./markdown-text-range.js";

export class MarkdownTextRun {
  public readonly tokens: readonly Token[];
  public readonly text: string;
  public readonly ranges: MarkdownTextRange[] = [];
  public opens: number = 0;
  public closes: number = 0;

  public constructor(tokens: readonly Token[], text: string) {
    this.tokens = tokens;
    this.text = text;
  }

  public cover(start: number, end: number): void {
    this.ranges.push(new MarkdownTextRange(start, end));
  }
}
