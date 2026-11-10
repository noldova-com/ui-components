/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { MentionCandidate } from "./mention-candidate.js";

export class MentionRow {
  public readonly candidate: MentionCandidate;
  public readonly id: string;
  public readonly section: string | null;
  public readonly name: string;

  public constructor(candidate: MentionCandidate, id: string, section: string | null, name: string) {
    this.candidate = candidate;
    this.id = id;
    this.section = section;
    this.name = name;
  }
}
