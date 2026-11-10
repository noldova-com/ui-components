/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { MentionCandidate } from "./mention-candidate.js";

export class MarkdownMentionPart {
  public readonly text: string;
  public readonly mention: MentionCandidate | null;

  public constructor(text: string, mention: MentionCandidate | null) {
    this.text = text;
    this.mention = mention;
  }
}
