/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MentionCompletionResources {
  public static readonly mentionQueryPattern: RegExp = /(?:^|\s|\()@[\p{L}\p{M}\p{Nd}_-]*(?: +[\p{L}\p{M}\p{Nd}_-]+)* *$/u;
  public static readonly mentionTailEndPattern: RegExp = /[^\p{L}\p{M}\p{Nd}_-]/u;
}
