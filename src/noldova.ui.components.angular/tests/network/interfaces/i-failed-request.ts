/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// What Playwright's request.failure() gives for a request that failed: the browser's network error, such as "net::ERR_ABORTED".
export interface IFailedRequest {
  readonly errorText: string;
}
