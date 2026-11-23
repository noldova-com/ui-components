/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownHtmlBlock {
  public readonly start: RegExp;
  public readonly end: RegExp | null;

  public constructor(start: RegExp, end: RegExp | null) {
    this.start = start;
    this.end = end;
  }
}
