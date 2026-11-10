/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MentionCandidateResources {
  public static readonly mentionNamePattern: RegExp = /^[\p{L}\p{M}\p{Nd}_-]+(?: [\p{L}\p{M}\p{Nd}_-]+)*$/u;
  public static readonly mentionNameParameter: string = "name";
  public static readonly mentionNoteParameter: string = "note";
  public static formatMentionNameInvalid(name: string): string {
    return `A mention's name is words of letters, marks, digits, _ and -, with one space between words, which "${name}" is not.`;
  }
}
