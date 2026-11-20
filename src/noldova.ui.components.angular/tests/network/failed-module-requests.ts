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
import type { IConnectionProbe } from "./interfaces/i-connection-probe.ts";
import { ConnectionProbe } from "./connection-probe.ts";

// Prints each module request the browser fails, so a spec file that fails to import names why: one that ends in a network error, with the error, and
// one answered with an error status or with a type the browser won't run as a module, with the status and the type. A request whose connection
// failed also prints what its port held just after, from ConnectionProbe. Playwright reports every request's end whether or not anything listens,
// so the listeners add no work of their own beyond these checks. A request of any type still open 10 s after it started is printed too, with the
// other open requests it may wait behind, and again once it ends, so a stylesheet or module that never arrives names itself before its file's
// import fails.
export class FailedModuleRequests {
  private static readonly MODULE: string = "script";
  private static readonly NO_ERROR: string = "no network error given";
  private static readonly CONNECTION_ERROR: string = "net::ERR_CONNECTION_";
  private static readonly CONTENT_TYPE: string = "content-type";
  private static readonly NO_TYPE: string = "no content type";
  private static readonly PARAMETERS: RegExp = /;.*$/su;
  private static readonly FIRST_ERROR_STATUS: number = 400;
  private static readonly FIRST_REDIRECT_STATUS: number = 300;
  // A request still open this long after it started is printed as stalled, checked this often: a spec file's import fails after 30 s.
  private static readonly STALL_LIMIT: number = 10_000;
  private static readonly STALL_CHECK: number = 1_000;
  private static readonly MILLISECONDS_PER_SECOND: number = 1_000;
  // The oldest other open requests a stall lists: those are what it most likely waits behind, for one of the browser's six connections to a server.
  private static readonly LISTED_OTHERS: number = 20;
  // A run prints its first stalls only, and counts the rest, so a run that holds many requests doesn't flood its log.
  private static readonly PRINTED_STALLS: number = 20;
  private static readonly FINISHED: string = "finished";
  // The JavaScript MIME type essences the WHATWG MIME Sniffing standard lists; the browser runs a module script only with one of them.
  private static readonly JAVASCRIPT: ReadonlySet<string> = new Set(["application/ecmascript", "application/javascript", "application/x-ecmascript",
    "application/x-javascript", "text/ecmascript", "text/javascript", "text/javascript1.0", "text/javascript1.1", "text/javascript1.2",
    "text/javascript1.3", "text/javascript1.4", "text/javascript1.5", "text/jscript", "text/livescript", "text/x-ecmascript", "text/x-javascript"]);

  private readonly pages: WeakSet<IBrowserPage> = new WeakSet();
  // Requests whose response was printed: the browser then cancels the request too, which would print the same import again.
  private readonly printedResponses: WeakSet<IBrowserRequest> = new WeakSet();
  private readonly lines: string[] = [];
  private readonly probe: IConnectionProbe;
  // Probes still running: the run's close waits for them, so a refusal in the run's last spec file still prints what its port held.
  private readonly probing: Set<Promise<void>> = new Set();
  private isWaitedForOnClose: boolean = false;
  private readonly openRequests: Map<IBrowserRequest, number> = new Map();
  private readonly printedStalls: WeakSet<IBrowserRequest> = new WeakSet();
  private readonly countedStalls: WeakSet<IBrowserRequest> = new WeakSet();
  private stallsPrinted: number = 0;
  private unprintedStalls: number = 0;
  private readonly stallLimit: number;
  private readonly stallCheck: number;

  // The browser command: listens on the page that calls it, once per page, and gives every line printed so far.
  public readonly watch: (context: IBrowserCommandContext) => readonly string[] = context => this.watchPage(context.page, context.project.vitest);

  // The probe is ConnectionProbe unless given, as tests/network/scripted-refusal.ts gives one that fails.
  // The stall limit and check period are tests/network/scripted-stall.ts's to shorten.
  public constructor(probe: IConnectionProbe = new ConnectionProbe(), stallLimit: number = FailedModuleRequests.STALL_LIMIT, stallCheck: number = FailedModuleRequests.STALL_CHECK) {
    this.probe = probe;
    this.stallLimit = stallLimit;
    this.stallCheck = stallCheck;
  }

  private watchPage(page: IBrowserPage, run: IVitestRun): readonly string[] {
    if (!this.isWaitedForOnClose) {
      this.isWaitedForOnClose = true;
      const check = setInterval(() => this.printStalls(run), this.stallCheck).unref();
      run.onClose(() => {
        clearInterval(check);
        if (this.unprintedStalls > 0)
          this.log(`Stalled requests not printed, past the first ${FailedModuleRequests.PRINTED_STALLS}: ${this.unprintedStalls}`, run);
        return this.probedAsync();
      });
    }
    if (!this.pages.has(page)) {
      this.pages.add(page);
      page.on("request", request => this.openRequests.set(request, Date.now()));
      page.on("requestfinished", request => this.endRequest(request, FailedModuleRequests.FINISHED, run));
      page.on("requestfailed", request => this.recordRequest(request, run));
      page.on("response", response => this.recordResponse(response, run));
    }
    return [...this.lines];
  }

  private recordRequest(request: IBrowserRequest, run: IVitestRun): void {
    this.endRequest(request, `failed, ${request.failure()?.errorText ?? FailedModuleRequests.NO_ERROR}`, run);
    if (request.resourceType() !== FailedModuleRequests.MODULE || this.printedResponses.has(request))
      return;
    const error = request.failure()?.errorText ?? FailedModuleRequests.NO_ERROR;
    this.print(`Failed module request at ${new Date().toISOString()}: ${error} ${request.url()}`, run);
    const port = new URL(request.url()).port;
    if (error.startsWith(FailedModuleRequests.CONNECTION_ERROR) && port !== "") {
      const printing = this.printServerAsync(Number(port), request.url(), run);
      this.probing.add(printing);
      void printing.finally(() => this.probing.delete(printing));
    }
  }

  // Each probe ends within ConnectionProbe's connect and listing limits, so the close waits a few seconds at most, within Vitest's teardown limit.
  private async probedAsync(): Promise<void> {
    await Promise.all(this.probing);
  }

  // Only a URL that names its port is probed, as the test server's always do.
  private async printServerAsync(port: number, url: string, run: IVitestRun): Promise<void> {
    const at = new Date().toISOString();
    const found = await this.probe.probeAsync(port).catch((error: unknown) => `the port couldn't be probed: ${error instanceof Error ? error.message : String(error)}`);
    this.print(`Failed module request's server at ${at}, port ${port}: ${found} ${url}`, run);
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

  // A request of any type, a stylesheet or a fetch too, still open past the limit is printed once, with the other open requests, oldest first.
  private printStalls(run: IVitestRun): void {
    const now = Date.now();
    const open = [...this.openRequests].sort((a, b) => a[1] - b[1]);
    for (const [request, start] of open) {
      if (now - start < this.stallLimit || this.countedStalls.has(request))
        continue;
      this.countedStalls.add(request);
      if (this.stallsPrinted === FailedModuleRequests.PRINTED_STALLS) {
        this.unprintedStalls++;
        continue;
      }
      this.stallsPrinted++;
      this.printedStalls.add(request);
      const others = open.filter(t => t[0] !== request);
      const listed = others.slice(0, FailedModuleRequests.LISTED_OTHERS).map(([t, u]) => `${t.resourceType()} ${t.url()} open ${FailedModuleRequests.seconds(now - u)} s`);
      const unlisted = others.length - listed.length;
      const list = listed.length === 0 ? "" : `, oldest first: ${listed.join(", ")}${unlisted === 0 ? "" : `, and ${unlisted} more`}`;
      this.log(`Stalled request at ${new Date(now).toISOString()}: ${request.resourceType()} ${request.url()} open ${FailedModuleRequests.seconds(now - start)} s since ${new Date(start).toISOString()}; ${others.length} other requests open${list}`, run);
    }
  }

  // A stalled request's end is printed too, so a slow answer reads apart from one that never came.
  private endRequest(request: IBrowserRequest, end: string, run: IVitestRun): void {
    const start = this.openRequests.get(request);
    this.openRequests.delete(request);
    if (start !== undefined && this.printedStalls.has(request))
      this.log(`Stalled request ended at ${new Date().toISOString()}: ${end} after ${FailedModuleRequests.seconds(Date.now() - start)} s, ${request.resourceType()} ${request.url()}`, run);
  }

  private static seconds(milliseconds: number): string {
    return (milliseconds / FailedModuleRequests.MILLISECONDS_PER_SECOND).toFixed(1);
  }

  // Failure lines are given back to the spec files that ask; stall lines go to the log only.
  private print(line: string, run: IVitestRun): void {
    this.lines.push(line);
    this.log(line, run);
  }

  private log(line: string, run: IVitestRun): void {
    run.logger.log(line);
  }
}
