/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DiffExpandDirection } from "../enums/diff-expand-direction.js";

export class DiffContextRequest {
  public readonly fileId: string;
  public readonly hunkId: string;
  public readonly direction: DiffExpandDirection;

  public constructor(fileId: string, hunkId: string, direction: DiffExpandDirection) {
    this.fileId = fileId;
    this.hunkId = hunkId;
    this.direction = direction;
  }
}
