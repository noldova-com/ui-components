/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MentionChipResources {
  public static readonly mentionChipTextPattern: RegExp = /^@[\p{L}\p{M}\p{Nd}_-]+(?: [\p{L}\p{M}\p{Nd}_-]+)*$/u;
  public static readonly mentionTextParameter: string = "text";
  public static readonly mentionStartParameter: string = "start";
  public static formatMentionChipTextInvalid(text: string): string {
    return `A mention chip's text is @ and a name of words of letters, marks, digits, _ and -, with one space between words, which "${text}" is not.`;
  }
  public static formatMentionStartOutOfRange(start: number): string {
    return `A mention chip starts at a whole number of characters from 0, which ${start} is not.`;
  }
}
