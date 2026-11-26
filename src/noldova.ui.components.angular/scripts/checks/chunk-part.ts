/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class ChunkPart {
  public readonly chunk: string;
  public readonly part: string;

  public constructor(chunk: string, part: string) {
    this.chunk = chunk;
    this.part = part;
  }
}
