/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class ToolCallResources {
  public static readonly toolCallEndWithoutStart: string = "A tool call that ended must have a start time.";
  public static readonly toolCallEndBeforeStart: string = "A tool call can't end before it started.";
  public static formatToolCallIdRepeated(id: string): string {
    return `A tool call and its nested calls each need their own id, but ${id} appears more than once.`;
  }
}
