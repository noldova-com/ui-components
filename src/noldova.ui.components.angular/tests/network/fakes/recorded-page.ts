/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IBrowserPage } from "../interfaces/i-browser-page.ts";
import type { IBrowserRequest } from "../interfaces/i-browser-request.ts";
import type { IBrowserResponse } from "../interfaces/i-browser-response.ts";
import type { RefusedRequest } from "./refused-request.ts";

// A page that keeps the listeners on its failed requests and fails a request when told, as Playwright's page does when the browser fails one.
export class RecordedPage implements IBrowserPage {
  private readonly failedListeners: ((request: RefusedRequest) => void)[] = [];

  public on(event: "requestfailed", listener: (request: IBrowserRequest) => void): unknown;
  public on(event: "response", listener: (response: IBrowserResponse) => void): unknown;
  public on(event: "requestfailed" | "response", listener: (request: RefusedRequest) => void): unknown {
    if (event === "requestfailed")
      this.failedListeners.push(listener);
    return this;
  }

  public fail(request: RefusedRequest): void {
    for (const listener of this.failedListeners)
      listener(request);
  }
}
