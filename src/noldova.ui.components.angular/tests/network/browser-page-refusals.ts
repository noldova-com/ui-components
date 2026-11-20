/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IVitestRun } from "../coverage/interfaces/i-vitest-run.ts";
import { ConnectionProbe } from "./connection-probe.ts";
import type { IConnectionProbe } from "./interfaces/i-connection-probe.ts";
import type { IListeningServer } from "./interfaces/i-listening-server.ts";
import type { IVitestProject } from "./interfaces/i-vitest-project.ts";

// When a run's browser page can't open because the connection to its server failed, Vitest says only that the page's navigation was refused, and the
// run then has no test. So this plugin follows every server of the run from its start, and wraps the project's opening of its browser page, Vitest's
// TestProject._openBrowserPage, the one place the page's URL is known; when the opening fails with a net::ERR_CONNECTION_ error, it prints the URL's
// host and port, each server's addresses and family as it listened and whether it closed, and what the port held then, before the error goes on.
export class BrowserPageRefusals {
  private static readonly OPEN: string = "_openBrowserPage";
  private static readonly CONNECTION_ERROR: string = "net::ERR_CONNECTION_";
  private static readonly URL_PATTERN: RegExp = /\bhttps?:\/\/[^\s"']+/u;

  private readonly probe: IConnectionProbe;
  // Each server's events, in the order the run created the servers.
  private readonly servers: string[][] = [];
  private watched: number = 0;

  public readonly plugin = {
    name: "noldova:browser-page-refusals",
    configureServer: (server: { readonly httpServer: IListeningServer | null }): void => this.follow(server.httpServer),
    configureVitest: (context: { readonly project: IVitestProject }): void => this.watch(context.project)
  };

  // The browser command that tells a spec what the run's own recorder follows: how many projects it watches, and each server's events so far.
  public readonly watching: () => readonly [number, readonly string[]] = () => [this.watched, this.servers.map(t => t.join(", then "))];

  // The probe is ConnectionProbe unless given, as tests/network/scripted-page-refusal.ts gives one that fails.
  public constructor(probe: IConnectionProbe = new ConnectionProbe()) {
    this.probe = probe;
  }

  public follow(server: IListeningServer | null): void {
    if (server === null)
      return;
    const events: string[] = [];
    this.servers.push(events);
    server.on("listening", () => events.push(`listened on ${BrowserPageRefusals.describe(server.address())}`));
    server.on("close", () => events.push("closed"));
  }

  // A Vitest whose project no longer opens its page there fails every run at once, rather than leaving a refusal unexplained.
  public watch(project: IVitestProject): void {
    const open: unknown = Reflect.get(project, BrowserPageRefusals.OPEN);
    if (typeof open !== "function")
      throw new Error(`Vitest's project has no ${BrowserPageRefusals.OPEN}, so a browser page's refused connection can't be explained; see tests/network/browser-page-refusals.ts.`);
    this.watched++;
    Reflect.set(project, BrowserPageRefusals.OPEN, async (...args: unknown[]): Promise<void> => {
      try {
        const opening: unknown = Reflect.apply(open, project, args);
        await opening;
      }
      catch (error) {
        await this.printAsync(error, project.vitest);
        throw error;
      }
    });
  }

  private async printAsync(error: unknown, run: IVitestRun): Promise<void> {
    const message = error instanceof Error ? error.message : String(error);
    const url = BrowserPageRefusals.URL_PATTERN.exec(message)?.[0];
    if (!message.includes(BrowserPageRefusals.CONNECTION_ERROR) || url === undefined)
      return;
    const at = new Date().toISOString();
    const { hostname, port } = new URL(url);
    const found = await this.probe.probeAsync(Number(port)).catch((reason: unknown) => `the port couldn't be probed: ${reason instanceof Error ? reason.message : String(reason)}`);
    const servers = this.servers.map((events, index) => `server ${index + 1} ${events.length === 0 ? "never listened" : events.join(", then ")}`).join("; ");
    run.logger.log(`Browser page refused at ${at}: ${url} names host ${hostname}, port ${port}; the run's servers: ${servers}; the port: ${found}`);
  }

  private static describe(address: ReturnType<IListeningServer["address"]>): string {
    return typeof address === "object" && address !== null ? `${address.address} port ${address.port} (${address.family})` : String(address);
  }
}
