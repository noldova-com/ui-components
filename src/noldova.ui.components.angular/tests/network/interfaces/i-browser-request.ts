/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IFailedRequest } from "./i-failed-request.ts";

// The part of Playwright's Request the recorder reads.
export interface IBrowserRequest {
  url(): string;
  resourceType(): string;
  failure(): IFailedRequest | null;
}
