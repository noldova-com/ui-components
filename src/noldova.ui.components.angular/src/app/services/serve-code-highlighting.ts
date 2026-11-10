/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { ICodeHighlightingWorkerScope } from "../interfaces/i-code-highlighting-worker-scope.js";
import { CodeWorkerServer } from "../models/code-worker-server.js";
import { SystemTimeSource } from "./system-time-source.js";

export function serveCodeHighlighting(scope: ICodeHighlightingWorkerScope): void {
  new CodeWorkerServer(scope, new SystemTimeSource());
}
