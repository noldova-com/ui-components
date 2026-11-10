/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class ToolCallViewsResources {
  public static formatToolCallShownInvalid(count: number): string {
    return `A shown count must be a whole number of 0 or more, not ${count}.`;
  }
}
