/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ConnectionProbe } from "./connection-probe.ts";
import { FailedModuleRequests } from "./failed-module-requests.ts";
import { OpenRequest } from "./fakes/open-request.ts";
import { RecordedPage } from "./fakes/recorded-page.ts";
import { RecordedRun } from "./fakes/recorded-run.ts";

// The browser command that has a recorder of its own, with no stall limit and a short check, see requests stall, and gives the lines it printed once
// its run closed. "crowd": a stylesheet stalls ahead of 21 scripts, after a fetch that finished at once, and then the stylesheet finishes and the
// first script fails; "alone": one stylesheet stalls with nothing else open. Its lines go to its own run, not the spec run's output.
export class ScriptedStall {
  private static readonly CHECK: number = 10;
  private static readonly SCRIPTS: number = 21;
  private static readonly ORIGIN: string = "http://localhost:24316";
  private static readonly STALLED: string = "Stalled request at ";

  public readonly print: (context: unknown, scenario: string) => Promise<readonly string[]> = async (_context, scenario) => {
    if (scenario !== "crowd" && scenario !== "alone")
      throw new Error(`No scripted stall is named "${scenario}"; the names are crowd and alone.`);
    const page = new RecordedPage();
    const run = new RecordedRun();
    new FailedModuleRequests(new ConnectionProbe(), 0, ScriptedStall.CHECK).watch({ page, project: { vitest: run } });
    const stylesheet = new OpenRequest("stylesheet", `${ScriptedStall.ORIGIN}/styles.css`);
    page.open(stylesheet);
    if (scenario === "alone") {
      await ScriptedStall.untilStalledAsync(run, 1);
      await run.closeAsync();
      return run.lines;
    }
    const fetched = new OpenRequest("fetch", `${ScriptedStall.ORIGIN}/finished.json`);
    page.open(fetched);
    page.finish(fetched);
    const script = (index: number): OpenRequest => new OpenRequest("script", `${ScriptedStall.ORIGIN}/chunk-${index}.js`, "net::ERR_ABORTED");
    const first = script(0);
    const scripts = [first, ...Array.from({ length: ScriptedStall.SCRIPTS - 1 }, (_, i) => script(i + 1))];
    for (const script of scripts)
      page.open(script);
    await ScriptedStall.untilStalledAsync(run, 1 + ScriptedStall.SCRIPTS);
    page.finish(stylesheet);
    page.fail(first);
    await run.closeAsync();
    return run.lines;
  };

  // Waits for the stall lines themselves, a check period at a time; the spec's test limit bounds it.
  private static async untilStalledAsync(run: RecordedRun, count: number): Promise<void> {
    while (run.lines.filter(t => t.startsWith(ScriptedStall.STALLED)).length < count)
      await new Promise(resolve => setTimeout(resolve, ScriptedStall.CHECK));
  }
}
