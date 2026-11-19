/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IVitestLogger } from "./i-vitest-logger.ts";

export interface IVitestRun {
  readonly logger: IVitestLogger;

  // Vitest's close waits for a listener's promise.
  onClose(listener: () => void | Promise<void>): void;
}
