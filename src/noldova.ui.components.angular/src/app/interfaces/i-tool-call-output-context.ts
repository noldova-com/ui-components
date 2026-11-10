/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ToolCall } from "../models/tool-call.js";

export interface IToolCallOutputContext {
  readonly $implicit: ToolCall;
}
