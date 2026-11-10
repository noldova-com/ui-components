/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class LinkReferenceMatch {
  public readonly start: number;
  public readonly length: number;
  public readonly url: string;

  public constructor(start: number, length: number, url: string) {
    this.start = start;
    this.length = length;
    this.url = url;
  }
}
