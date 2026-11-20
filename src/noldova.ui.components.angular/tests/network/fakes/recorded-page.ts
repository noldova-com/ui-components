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
import type { IConsoleMessage } from "../interfaces/i-console-message.ts";

// A page that keeps the listeners on its requests' start, finish and failure, and starts, finishes or fails a request when told, as Playwright's
// page does when the browser does. It takes response and console listeners and never calls them.
export class RecordedPage implements IBrowserPage {
  private readonly listeners: Map<string, ((request: IBrowserRequest & IBrowserResponse) => void)[]> = new Map();

  public on(event: "request" | "requestfinished", listener: (request: IBrowserRequest) => void): unknown;
  public on(event: "requestfailed", listener: (request: IBrowserRequest) => void): unknown;
  public on(event: "response", listener: (response: IBrowserResponse) => void): unknown;
  public on(event: "console", listener: (message: IConsoleMessage) => void): unknown;
  public on(...args: ["request" | "requestfinished" | "requestfailed", (request: IBrowserRequest & IBrowserResponse) => void]
    | ["response", (response: IBrowserResponse) => void] | ["console", (message: IConsoleMessage) => void]): unknown {
    if (args[0] === "response" || args[0] === "console")
      return this;
    const [event, listener] = args;
    this.listeners.set(event, [...this.listeners.get(event) ?? [], listener]);
    return this;
  }

  public open(request: IBrowserRequest & IBrowserResponse): void {
    this.emit("request", request);
  }

  public finish(request: IBrowserRequest & IBrowserResponse): void {
    this.emit("requestfinished", request);
  }

  public fail(request: IBrowserRequest & IBrowserResponse): void {
    this.emit("requestfailed", request);
  }

  private emit(event: string, request: IBrowserRequest & IBrowserResponse): void {
    for (const listener of this.listeners.get(event) ?? [])
      listener(request);
  }
}
