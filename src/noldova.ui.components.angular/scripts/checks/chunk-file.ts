/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class ChunkFile {
  public readonly chunk: string;
  public readonly file: string;
  public readonly bytes: number;

  public constructor(chunk: string, file: string, bytes: number) {
    this.chunk = chunk;
    this.file = file;
    this.bytes = bytes;
  }
}
