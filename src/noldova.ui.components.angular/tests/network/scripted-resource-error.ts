/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { randomUUID } from "node:crypto";

import type { ISocketCensus } from "./interfaces/i-socket-census.ts";
import { ClosedPort } from "./closed-port.ts";
import { FailedModuleRequests } from "./failed-module-requests.ts";
import { RecordedPage } from "./fakes/recorded-page.ts";
import { RecordedRun } from "./fakes/recorded-run.ts";
import { RefusedRequest } from "./fakes/refused-request.ts";
import { RejectingConnectionProbe } from "./fakes/rejecting-connection-probe.ts";
import { SampleListings } from "./fakes/sample-listings.ts";
import { SocketCensus } from "./socket-census.ts";

// The browser command that has a recorder of its own see module requests fail with the network error the spec names, with the socket census it
// names in place of the run's, and gives the lines it printed once its run closed: Windows' listings of a machine short of ports, listings that
// fail, some stopped at the limit as on a loaded machine, this machine's own, or another platform's, none of which the browser can be made to give on cue. Its lines go to its own run.
export class ScriptedResourceError {
  private static readonly CENSUSES: ReadonlyMap<string, () => ISocketCensus> = new Map<string, () => ISocketCensus>([
    ["sample", () => new SocketCensus("win32", SampleListings.listAsync)],
    ["failing", () => new SocketCensus("win32", command => Promise.reject(new Error(`${command} failed: scripted`)))],
    ["partly stopped", () => new SocketCensus("win32", command => command === "netstat" ? SampleListings.listAsync(command)
      : Promise.reject(new Error(`${command} failed: The operation was aborted`)))],
    ["this machine", () => new SocketCensus()],
    ["elsewhere", () => new SocketCensus("linux")]
  ]);

  public readonly print: (context: unknown, census: string, errorText: string, count?: number) => Promise<readonly string[]> = async (_context, census, errorText, count = 1) => {
    const create = ScriptedResourceError.CENSUSES.get(census);
    if (create === undefined)
      throw new Error(`No scripted census is named "${census}"; the names are ${[...ScriptedResourceError.CENSUSES.keys()].join(", ")}.`);
    const port = await new ClosedPort().find();
    const page = new RecordedPage();
    const run = new RecordedRun();
    const recorder = new FailedModuleRequests(new RejectingConnectionProbe(), undefined, undefined, create());
    recorder.watch({ page, project: { vitest: run } });
    for (let i = 0; i < count; i++) {
      const url = `http://localhost:${port}/scripted-${randomUUID()}.js`;
      recorder.expectFailure(undefined, url);
      page.fail(new RefusedRequest(url, errorText));
    }
    await run.closeAsync();
    return run.lines;
  };
}
