/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { ToolCallOutputState } from "../enums/tool-call-output-state.js";
import type { ToolCall } from "../models/tool-call.js";
import type { ToolCallInput } from "../models/tool-call-input.js";

export interface IToolCallOptions {
  readonly target?: string;
  readonly startedAt?: Date;
  readonly endedAt?: Date;
  readonly input?: ToolCallInput;
  readonly output?: string;
  readonly outputState?: ToolCallOutputState;
  readonly hasOutputControl?: boolean;
  readonly error?: string;
  readonly canCancel?: boolean;
  readonly children?: readonly ToolCall[];
}
