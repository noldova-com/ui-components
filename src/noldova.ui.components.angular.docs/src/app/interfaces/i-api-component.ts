/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IApiInput } from "./i-api-input.js";
import type { IApiOutput } from "./i-api-output.js";

export interface IApiComponent {
  readonly name: string;
  readonly entry: string;
  readonly selector: string;
  readonly description: readonly string[];
  readonly inputs: readonly IApiInput[];
  readonly outputs: readonly IApiOutput[];
}
