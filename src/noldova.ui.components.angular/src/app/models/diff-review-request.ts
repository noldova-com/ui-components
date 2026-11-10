/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { DiffReviewState } from "../enums/diff-review-state.js";

export class DiffReviewRequest {
  public readonly fileId: string;
  public readonly hunkId: string | null;
  public readonly state: DiffReviewState;

  public constructor(fileId: string, hunkId: string | null, state: DiffReviewState) {
    this.fileId = fileId;
    this.hunkId = hunkId;
    this.state = state;
  }
}
