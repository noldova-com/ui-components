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
// first script fails; "alone": one stylesheet stalls with nothing else open; "many": 23 scripts stall at once and then finish. "answer" gives what
// the recorder's own command gives back after a stylesheet stalled and a module failed, in place of the lines. Its lines go to its own run, not the
// spec run's output.
export class ScriptedStall {
  private static readonly SCENARIOS: readonly string[] = ["crowd", "alone", "many", "answer"];
  private static readonly CHECK: number = 10;
  private static readonly SCRIPTS: number = 21;
  private static readonly MANY: number = 23;
  private static readonly PRINTED: number = 20;
  private static readonly ORIGIN: string = "http://localhost:24316";
  private static readonly STALLED: string = "Stalled request at ";

  public readonly print: (context: unknown, scenario: string) => Promise<readonly string[]> = async (_context, scenario) => {
    if (!ScriptedStall.SCENARIOS.includes(scenario))
      throw new Error(`No scripted stall is named "${scenario}"; the names are ${ScriptedStall.SCENARIOS.join(", ")}.`);
    const page = new RecordedPage();
    const run = new RecordedRun();
    const recorder = new FailedModuleRequests(new ConnectionProbe(), 0, ScriptedStall.CHECK);
    const context = { page, project: { vitest: run } };
    recorder.watch(context);
    const script = (index: number, errorText: string | null = null): OpenRequest => new OpenRequest("script", `${ScriptedStall.ORIGIN}/chunk-${index}.js`, errorText);
    if (scenario === "many") {
      const scripts = Array.from({ length: ScriptedStall.MANY }, (_, i) => script(i));
      for (const request of scripts)
        page.open(request);
      await ScriptedStall.untilStalledAsync(run, ScriptedStall.PRINTED);
      for (const request of scripts)
        page.finish(request);
      await run.closeAsync();
      return run.lines;
    }
    const stylesheet = new OpenRequest("stylesheet", `${ScriptedStall.ORIGIN}/styles.css`);
    page.open(stylesheet);
    if (scenario === "alone") {
      await ScriptedStall.untilStalledAsync(run, 1);
      await run.closeAsync();
      return run.lines;
    }
    if (scenario === "answer") {
      await ScriptedStall.untilStalledAsync(run, 1);
      page.fail(script(0, "net::ERR_ABORTED"));
      const answer = recorder.watch(context);
      await run.closeAsync();
      return answer;
    }
    const fetched = new OpenRequest("fetch", `${ScriptedStall.ORIGIN}/finished.json`);
    page.open(fetched);
    page.finish(fetched);
    const first = script(0, "net::ERR_ABORTED");
    const scripts = [first, ...Array.from({ length: ScriptedStall.SCRIPTS - 1 }, (_, i) => script(i + 1, "net::ERR_ABORTED"))];
    for (const request of scripts)
      page.open(request);
    await ScriptedStall.untilStalledAsync(run, ScriptedStall.PRINTED);
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
