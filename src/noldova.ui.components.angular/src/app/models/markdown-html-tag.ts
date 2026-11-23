/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownHtmlTag {
  public readonly start: number;
  public readonly end: number;
  public readonly opened: string | null;
  public readonly closed: string | null;

  public constructor(start: number, end: number, opened: string | null, closed: string | null) {
    this.start = start;
    this.end = end;
    this.opened = opened;
    this.closed = closed;
  }
}
