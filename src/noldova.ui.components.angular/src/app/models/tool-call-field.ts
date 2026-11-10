/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ArgumentException } from "@noldova/context.exceptions";

export class ToolCallField {
  public readonly key: string;
  public readonly value: string;

  public constructor(key: string, value: string) {
    ArgumentException.throwIfNullOrWhitespace(key, "key");

    this.key = key;
    this.value = value;
  }
}
