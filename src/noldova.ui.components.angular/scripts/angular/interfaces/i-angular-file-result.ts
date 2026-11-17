/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IAngularTestResult } from "./i-angular-test-result.ts";

export interface IAngularFileResult {
  readonly name: string;
  readonly assertionResults?: readonly IAngularTestResult[];
}
