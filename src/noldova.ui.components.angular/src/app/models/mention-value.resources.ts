/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Resources } from "../../resources.js";

export class MentionValueResources {
  public static readonly mentionTokenPattern: RegExp = /\[(@[\p{L}\p{M}\p{Nd}_-]+(?: [\p{L}\p{M}\p{Nd}_-]+)*)\]\(mention:([^()\s]+)\)/gu;
  public static readonly mentionIdReservedPattern: RegExp = /[!'()*]/gu;
  public static readonly mentionChipsParameter: string = "chips";
  public static formatMentionChipMisplaced(text: string, start: number): string {
    return `The mention chip "${text}" at ${start} is not the text there, or comes before the chip ahead of it ends.`;
  }
  public static formatMentionToken(text: string, id: string): string {
    return `[${text}](${Resources.mentionScheme}${id})`;
  }
}
