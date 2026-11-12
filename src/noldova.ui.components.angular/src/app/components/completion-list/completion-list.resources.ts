/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@noldova/context.core";

export class CompletionListResources {
  public static formatCompletionOption(label: string, note: string | null): string {
    return Object.isNull(note) ? label : `${label}, ${note}`;
  }
  public static formatCompletionOptionId(listId: string, index: number): string {
    return `${listId}-option-${index}`;
  }
  public static formatCompletionListRoom(maxHeight: number): string {
    return `${maxHeight}px`;
  }
}
