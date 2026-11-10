/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

export class ToolCallInputResources {
  public static readonly toolCallFieldsEmpty: string = "A tool call's input needs at least one field.";
  public static formatToolCallField(key: string, value: string): string {
    return `${key}: ${value}`;
  }
}
