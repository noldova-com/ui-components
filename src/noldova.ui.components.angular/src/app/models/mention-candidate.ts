/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";
import { ArgumentException, ArgumentOutOfRangeException } from "@noldova/context.exceptions";

import type { AvatarColor } from "../enums/avatar-color.js";
import type { IMentionCandidateOptions } from "../interfaces/i-mention-candidate-options.js";
import { Resources } from "../../resources.js";
import { MentionCandidateResources } from "./mention-candidate.resources.js";

export class MentionCandidate {
  public readonly id: string;
  public readonly name: string;
  public readonly image: string | null;
  public readonly initials: string | null;
  public readonly color: number | null;
  public readonly avatarColor: AvatarColor | null;
  public readonly section: string | null;
  public readonly note: string | null;
  public readonly unavailable: boolean;

  public constructor(id: string, name: string, options: IMentionCandidateOptions = {}) {
    ArgumentException.throwIfNullOrWhitespace(id, Resources.mentionIdParameter);
    if (!MentionCandidateResources.mentionNamePattern.test(name))
      throw new ArgumentException(MentionCandidateResources.formatMentionNameInvalid(name), MentionCandidateResources.mentionNameParameter);
    const note = options.note ?? null;
    if (!Object.isNull(note))
      ArgumentException.throwIfNullOrWhitespace(note, MentionCandidateResources.mentionNoteParameter);
    const color = options.color ?? null;
    if (!Object.isNull(color) && (!Number.isInteger(color) || color < 1 || color > Resources.authorColorCount))
      throw new ArgumentOutOfRangeException(Resources.avatarColorParameter, color, Resources.formatAuthorColorOutOfRange(Resources.avatarColorParameter, color));

    this.id = id;
    this.name = name;
    this.image = options.image ?? null;
    this.initials = options.initials ?? null;
    this.color = color;
    this.avatarColor = options.avatarColor ?? null;
    this.section = options.section ?? null;
    this.note = note;
    this.unavailable = options.unavailable ?? false;
  }
}
