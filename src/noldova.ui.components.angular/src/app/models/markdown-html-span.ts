/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownHtmlSpan {
  public readonly open: RegExp;
  public readonly close: string;

  public constructor(open: RegExp, close: string) {
    this.open = open;
    this.close = close;
  }
}
