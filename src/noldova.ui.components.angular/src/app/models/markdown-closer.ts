/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MarkdownCloser {
  private readonly find: (from: number) => number;
  private searched: number = Number.POSITIVE_INFINITY;
  private found: number = -1;
  private none: number = Number.POSITIVE_INFINITY;

  public constructor(find: (from: number) => number) {
    this.find = find;
  }

  public at(from: number): number {
    if (from >= this.none)
      return -1;
    if (from >= this.searched && from <= this.found)
      return this.found;
    const found = this.find(from);
    if (found < 0)
      this.none = from;
    else {
      this.searched = from;
      this.found = found;
    }
    return found;
  }
}
