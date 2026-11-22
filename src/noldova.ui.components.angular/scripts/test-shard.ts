/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class TestShard {
  public readonly part: number;
  public readonly parts: number;

  public constructor(part: number, parts: number) {
    this.part = part;
    this.parts = parts;
  }
}
