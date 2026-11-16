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
import type { IBrowserResponse } from "./interfaces/i-browser-response.ts";

// Prints each module request the browser fails, so a spec file that fails to import names why: one that ends in a network error, with the error, and
// one answered with an error status or with a type the browser won't run as a module, with the status and the type. Playwright reports every
// request's end whether or not anything listens, so the listeners add no work of their own beyond these checks.
export class FailedModuleRequests {
  private static readonly MODULE: string = "script";
  private static readonly NO_ERROR: string = "no network error given";
  private static readonly CONTENT_TYPE: string = "content-type";
  private static readonly NO_TYPE: string = "no content type";
  private static readonly PARAMETERS: RegExp = /;.*$/su;
  private static readonly FIRST_ERROR_STATUS: number = 400;
  private static readonly FIRST_REDIRECT_STATUS: number = 300;
  // The JavaScript MIME type essences the WHATWG MIME Sniffing standard lists; the browser runs a module script only with one of them.
  private static readonly JAVASCRIPT: ReadonlySet<string> = new Set(["application/ecmascript", "application/javascript", "application/x-ecmascript",
    "application/x-javascript", "text/ecmascript", "text/javascript", "text/javascript1.0", "text/javascript1.1", "text/javascript1.2",
    "text/javascript1.3", "text/javascript1.4", "text/javascript1.5", "text/jscript", "text/livescript", "text/x-ecmascript", "text/x-javascript"]);

  private readonly pages: WeakSet<IBrowserPage> = new WeakSet();
  // Requests whose response was printed: the browser then cancels the request too, which would print the same import again.
  private readonly printedResponses: WeakSet<IBrowserRequest> = new WeakSet();
  private readonly lines: string[] = [];

  // The browser command: listens on the page that calls it, once per page, and gives every line printed so far.
  public readonly watch: (context: IBrowserCommandContext) => readonly string[] = context => this.watchPage(context.page, context.project.vitest);

  private watchPage(page: IBrowserPage, run: IVitestRun): readonly string[] {
    if (!this.pages.has(page)) {
      this.pages.add(page);
      page.on("requestfailed", request => this.recordRequest(request, run));
      page.on("response", response => this.recordResponse(response, run));
    }
    return [...this.lines];
  }

  private recordRequest(request: IBrowserRequest, run: IVitestRun): void {
    if (request.resourceType() === FailedModuleRequests.MODULE && !this.printedResponses.has(request))
      this.print(`Failed module request at ${new Date().toISOString()}: ${request.failure()?.errorText ?? FailedModuleRequests.NO_ERROR} ${request.url()}`, run);
  }

  // A redirect's response is followed by the one it leads to, and a 304 lets the browser run the copy it holds, so only an error status, or a success
  // whose type isn't JavaScript, fails the import.
  private recordResponse(response: IBrowserResponse, run: IVitestRun): void {
    if (response.request().resourceType() !== FailedModuleRequests.MODULE)
      return;
    const status = response.status();
    const type = response.headers()[FailedModuleRequests.CONTENT_TYPE] ?? FailedModuleRequests.NO_TYPE;
    const isJavaScript = FailedModuleRequests.JAVASCRIPT.has(type.replace(FailedModuleRequests.PARAMETERS, "").trim().toLowerCase());
    if (status < FailedModuleRequests.FIRST_ERROR_STATUS && (status >= FailedModuleRequests.FIRST_REDIRECT_STATUS || isJavaScript))
      return;
    this.printedResponses.add(response.request());
    this.print(`Failed module response at ${new Date().toISOString()}: ${status} ${type} ${response.url()}`, run);
  }

  private print(line: string, run: IVitestRun): void {
    this.lines.push(line);
    run.logger.log(line);
  }
}
