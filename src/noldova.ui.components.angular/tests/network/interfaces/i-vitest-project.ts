/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IVitestRun } from "../../coverage/interfaces/i-vitest-run.ts";

export interface IVitestProject {
  readonly vitest: IVitestRun;
}
