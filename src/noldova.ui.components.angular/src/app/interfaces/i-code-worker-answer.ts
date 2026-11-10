/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { CodeTokenKind } from "../enums/code-token-kind.js";
import type { CodeWorkerMessageKind } from "../enums/code-worker-message-kind.js";

export interface ICodeWorkerAnswer {
  readonly kind: CodeWorkerMessageKind;
  readonly id: number;
  readonly tokens: readonly (readonly [start: number, length: number, kind: CodeTokenKind])[];
  readonly error: Error | null;
}
