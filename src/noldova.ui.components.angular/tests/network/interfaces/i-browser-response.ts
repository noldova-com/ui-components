/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IBrowserRequest } from "./i-browser-request.ts";

// The part of Playwright's Response the recorder reads.
export interface IBrowserResponse {
  url(): string;
  status(): number;
  headers(): Record<string, string>;
  request(): IBrowserRequest;
  serverAddr(): Promise<{ ipAddress: string; port: number } | null>;
}
