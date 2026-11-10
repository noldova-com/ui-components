/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

import type { MentionCandidate } from "./mention-candidate.js";
import { MentionCompletionResources } from "./mention-completion.resources.js";
import { MentionFinder } from "./mention-finder.js";
import { Resources } from "../../resources.js";

export class MentionCompletion {
  public readonly start: number;
  public readonly end: number;
  public readonly choices: readonly MentionCandidate[];

  private constructor(start: number, end: number, choices: readonly MentionCandidate[]) {
    this.start = start;
    this.end = end;
    this.choices = choices;
  }

  public choiceAt(index: number): MentionCandidate {
    return this.choices[index % this.choices.length] as MentionCandidate;
  }

  public static at(text: string, caret: number, candidates: readonly MentionCandidate[]): MentionCompletion | null {
    const prefix = text.slice(0, caret);
    if (!MentionCompletionResources.mentionQueryPattern.test(prefix))
      return null;
    const start = prefix.lastIndexOf(Resources.mentionMarker);
    const query = MentionFinder.keyOf(prefix.slice(start + Resources.mentionMarker.length));
    const choices = candidates.filter(t => MentionFinder.keyOf(t.name).startsWith(query));
    const first = choices[0];
    if (Object.isUndefined(first))
      return null;
    const written = text.slice(0, start) + Resources.mentionMarker + first.name;
    if (!MentionFinder.find(written, [first]).some(t => t.start === start))
      return null;
    const tail = text.slice(caret).search(MentionCompletionResources.mentionTailEndPattern);
    return new MentionCompletion(start, tail < 0 ? text.length : caret + tail, choices);
  }
}
