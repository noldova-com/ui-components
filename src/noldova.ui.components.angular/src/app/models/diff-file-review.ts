/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import { DiffReviewState } from "../enums/diff-review-state.js";
import { DiffException } from "../exceptions/diff.exception.js";
import type { DiffFile } from "./diff-file.js";
import type { DiffReviewRequest } from "./diff-review-request.js";
import { Resources } from "../../resources.js";

export class DiffFileReview {
  public static readonly undecided: DiffFileReview = new DiffFileReview();

  public readonly hunkStates: ReadonlyMap<string, DiffReviewState>;
  public readonly state: DiffReviewState;

  public constructor(hunkStates: ReadonlyMap<string, DiffReviewState> = new Map(), state: DiffReviewState = DiffReviewState.Undecided) {
    this.hunkStates = hunkStates;
    this.state = state;
  }

  public hunkState(hunkId: string): DiffReviewState {
    return this.hunkStates.get(hunkId) ?? DiffReviewState.Undecided;
  }

  public stateOf(hunkIds: readonly string[]): DiffReviewState | null {
    const states = hunkIds.map(t => this.hunkState(t));
    const [first] = states;
    if (Object.isUndefined(first))
      return this.state;
    return states.every(t => t === first) ? first : null;
  }

  public applied(request: DiffReviewRequest, file: DiffFile): DiffFileReview {
    if (request.fileId !== file.id)
      throw new DiffException(Resources.formatDiffReviewOtherFile(request.fileId, file.id));
    const hunkIds = file.content.hunks.map(t => t.id);
    if (Object.isNull(request.hunkId))
      return new DiffFileReview(new Map(hunkIds.map(t => [t, request.state])), request.state);
    if (!hunkIds.includes(request.hunkId))
      throw new DiffException(Resources.formatDiffReviewUnknownHunk(request.hunkId, file.id));
    return new DiffFileReview(new Map([...this.hunkStates, [request.hunkId, request.state]]), this.state);
  }
}
