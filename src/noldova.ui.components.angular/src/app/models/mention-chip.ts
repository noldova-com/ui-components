/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException, ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import { Resources } from "../../resources.js";
import { MentionChipResources } from "./mention-chip.resources.js";

export class MentionChip {
  public readonly id: string;
  public readonly text: string;
  public readonly start: number;
  public readonly end: number;

  public constructor(id: string, text: string, start: number) {
    ArgumentException.throwIfNullOrWhitespace(id, Resources.mentionIdParameter);
    if (!MentionChipResources.mentionChipTextPattern.test(text))
      throw new ArgumentException(MentionChipResources.formatMentionChipTextInvalid(text), MentionChipResources.mentionTextParameter);
    if (!Number.isInteger(start) || start < 0)
      throw new ArgumentOutOfRangeException(MentionChipResources.mentionStartParameter, start, MentionChipResources.formatMentionStartOutOfRange(start));

    this.id = id;
    this.text = text;
    this.start = start;
    this.end = start + text.length;
  }
}
