/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class MentionCodeSpanResources {
  public static readonly mentionFencePattern: RegExp = / {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})/y;
  public static readonly mentionFenceClosingFlags: string = "gm";
  public static readonly mentionLineBreak: string = "\n";
  public static readonly mentionParagraphBreak: string = "\n\n";
  public static formatMentionFenceClosing(marker: string): string {
    return `^ {0,3}${marker[0]}{${marker.length},}[ \\t]*$`;
  }
}
