/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IBrowserRequest } from "./i-browser-request.ts";
import type { IBrowserResponse } from "./i-browser-response.ts";
import type { IConsoleMessage } from "./i-console-message.ts";

// The part of Playwright's Page the recorder listens on.
export interface IBrowserPage {
  on(event: "request" | "requestfinished", listener: (request: IBrowserRequest) => void): unknown;
  on(event: "requestfailed", listener: (request: IBrowserRequest) => void): unknown;
  on(event: "response", listener: (response: IBrowserResponse) => void): unknown;
  on(event: "console", listener: (message: IConsoleMessage) => void): unknown;
}
