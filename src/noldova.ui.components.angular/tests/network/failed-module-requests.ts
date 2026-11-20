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
import { NetLogTrace } from "./net-log-trace.ts";

// Prints each module request the browser fails, so a spec file that fails to import names why: one that ends in a network error, with the error, and
// one answered with an error status or with a type the browser won't run as a module, with the status and the type. A request whose connection
// failed also prints what its port held just after, from ConnectionProbe. Playwright reports every request's end whether or not anything listens,
// so the listeners add no work of their own beyond these checks.
export class FailedModuleRequests {
  private static readonly MODULE: string = "script";
  private static readonly NO_ERROR: string = "no network error given";
  private static readonly CONNECTION_ERROR: string = "net::ERR_CONNECTION_";
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
  private readonly probe: IConnectionProbe;
  // Probes still running: the run's close waits for them, so a refusal in the run's last spec file still prints what its port held.
  private readonly probing: Set<Promise<void>> = new Set();
  private isWaitedForOnClose: boolean = false;
  private readonly trace: NetLogTrace = new NetLogTrace();

  // The browser command: listens on the page that calls it, once per page, and gives every line printed so far.
  public readonly watch: (context: IBrowserCommandContext) => readonly string[] = context => this.watchPage(context.page, context.project.vitest);

  // The probe is ConnectionProbe unless given, as tests/network/scripted-refusal.ts gives one that fails.
  public constructor(probe: IConnectionProbe = new ConnectionProbe()) {
    this.probe = probe;
  }

  private watchPage(page: IBrowserPage, run: IVitestRun): readonly string[] {
    this.trace.start(page);
    if (!this.isWaitedForOnClose) {
      this.isWaitedForOnClose = true;
      run.onClose(async () => {
        await this.probedAsync();
        await this.trace.flushedAsync();
      });
    }
    if (!this.pages.has(page)) {
      this.pages.add(page);
      page.on("requestfailed", request => this.recordRequest(request, run));
      page.on("response", response => this.recordResponse(response, run));
    }
    return [...this.lines];
  }

  private recordRequest(request: IBrowserRequest, run: IVitestRun): void {
    if (request.resourceType() !== FailedModuleRequests.MODULE || this.printedResponses.has(request))
      return;
    const error = request.failure()?.errorText ?? FailedModuleRequests.NO_ERROR;
    this.print(`Failed module request at ${new Date().toISOString()}: ${error} ${request.url()}`, run);
    const port = new URL(request.url()).port;
    if (error.startsWith(FailedModuleRequests.CONNECTION_ERROR) && port !== "") {
      void this.trace.save(port, line => this.print(line, run));
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

  private print(line: string, run: IVitestRun): void {
    this.lines.push(line);
    run.logger.log(line);
  }
}
