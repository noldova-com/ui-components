/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownMathDelimiter {
  public readonly open: string;
  public readonly close: string;
  public readonly isDisplay: boolean;

  public constructor(open: string, close: string, isDisplay: boolean) {
    this.open = open;
    this.close = close;
    this.isDisplay = isDisplay;
  }
}
