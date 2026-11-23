/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownTextPlace {
  public readonly seen: number;
  public readonly last: number;
  public readonly line: number;

  public constructor(seen: number, last: number, line: number) {
    this.seen = seen;
    this.last = last;
    this.line = line;
  }
}
