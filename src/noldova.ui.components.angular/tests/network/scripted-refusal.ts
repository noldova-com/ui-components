/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { randomUUID } from "node:crypto";

import type { IConnectionProbe } from "./interfaces/i-connection-probe.ts";
import { ClosedPort } from "./closed-port.ts";
import { ConnectionProbe } from "./connection-probe.ts";
import { FailedModuleRequests } from "./failed-module-requests.ts";
import { RecordedPage } from "./fakes/recorded-page.ts";
import { RecordedRun } from "./fakes/recorded-run.ts";
import { RefusedRequest } from "./fakes/refused-request.ts";
import { RejectingConnectionProbe } from "./fakes/rejecting-connection-probe.ts";

// The browser command that has a recorder of its own see one module request refused at a closed port, with the probe the spec names in place of the
// run's, and gives the lines it printed once its run closed: a probe that throws, one whose socket listing fails, or one whose listing never ends,
// which the run's own probe can't be made to do. Its lines go to its own run, not the spec run's output.
export class ScriptedRefusal {
  private static readonly PROBES: ReadonlyMap<string, () => IConnectionProbe> = new Map<string, () => IConnectionProbe>([
    ["rejecting", () => new RejectingConnectionProbe()],
    ["failing listing", () => new ConnectionProbe([`no-such-listing-${randomUUID()}`, []])],
    ["hanging listing", () => new ConnectionProbe([process.execPath, ["-e", "setInterval(() => {}, 1000)"]])]
  ]);

  public readonly print: (context: unknown, probe: string, isExpected?: boolean, count?: number) => Promise<readonly string[]> = async (_context, probe, isExpected = false, count = 1) => {
    const create = ScriptedRefusal.PROBES.get(probe);
    if (create === undefined)
      throw new Error(`No scripted probe is named "${probe}"; the names are ${[...ScriptedRefusal.PROBES.keys()].join(", ")}.`);
    const port = await new ClosedPort().find();
    const page = new RecordedPage();
    const run = new RecordedRun();
    const recorder = new FailedModuleRequests(create());
    recorder.watch({ page, project: { vitest: run } });
    for (let i = 0; i < count; i++) {
      const url = `http://localhost:${port}/scripted-${randomUUID()}.js`;
      if (isExpected)
        recorder.expectFailure(undefined, url);
      page.fail(new RefusedRequest(url));
    }
    await run.closeAsync();
    return run.lines;
  };
}
