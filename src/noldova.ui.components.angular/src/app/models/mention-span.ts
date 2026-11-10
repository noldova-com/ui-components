/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { MentionCandidate } from "./mention-candidate.js";

export class MentionSpan {
  public readonly candidate: MentionCandidate;
  public readonly start: number;
  public readonly end: number;

  public constructor(candidate: MentionCandidate, start: number, end: number) {
    this.candidate = candidate;
    this.start = start;
    this.end = end;
  }
}
