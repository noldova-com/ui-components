/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

export class MentionListResources {
  public static formatMentionOption(name: string, note: string | null, section: string | null, unavailable: boolean): string {
    return [name, ...Object.isNull(note) ? [] : [note], ...unavailable ? [MentionListResources.mentionUnavailable] : [], ...Object.isNull(section) ? [] : [section]].join(", ");
  }
  public static readonly mentionUnavailable: string = "unavailable";
}
