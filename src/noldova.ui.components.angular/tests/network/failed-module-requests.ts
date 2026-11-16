/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IVitestRun } from "../coverage/interfaces/i-vitest-run.ts";
import type { IBrowserCommandContext } from "./interfaces/i-browser-command-context.ts";
import type { IBrowserPage } from "./interfaces/i-browser-page.ts";
import type { IBrowserRequest } from "./interfaces/i-browser-request.ts";

// Prints each module request the browser fails, with its network error, so a spec file that fails to import names why. Playwright reports every
// request's end whether or not anything listens, so a run where nothing fails prints nothing and takes no longer.
export class FailedModuleRequests {
  private static readonly MODULE: string = "script";
  private static readonly NO_ERROR: string = "no network error given";

  private readonly pages: WeakSet<IBrowserPage> = new WeakSet();
  private readonly lines: string[] = [];

  // The browser command: listens on the page that calls it, once per page, and gives every line printed so far.
  public readonly watch: (context: IBrowserCommandContext) => readonly string[] = context => this.watchPage(context.page, context.project.vitest);

  private watchPage(page: IBrowserPage, run: IVitestRun): readonly string[] {
    if (!this.pages.has(page)) {
      this.pages.add(page);
      page.on("requestfailed", request => this.record(request, run));
    }
    return [...this.lines];
  }

  private record(request: IBrowserRequest, run: IVitestRun): void {
    if (request.resourceType() !== FailedModuleRequests.MODULE)
      return;
    const line = `Failed module request at ${new Date().toISOString()}: ${request.failure()?.errorText ?? FailedModuleRequests.NO_ERROR} ${request.url()}`;
    this.lines.push(line);
    run.logger.log(line);
  }
}
