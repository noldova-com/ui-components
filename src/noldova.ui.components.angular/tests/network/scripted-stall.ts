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

// The browser command that has a recorder of its own, with a short check and, but in "limit", no stall limit, see requests stall, and gives the lines
// it printed once its run closed. "crowd": a stylesheet stalls ahead of 21 scripts, after a fetch that finished at once, and then the stylesheet
// finishes and the first script fails; "alone": one stylesheet stalls with nothing else open; "many": 23 scripts stall at once and then finish;
// "limit": with a 500 ms stall limit, a fetch finishes at once and a stylesheet stalls; "never": with no stall ever, a stylesheet waits. "answer"
// gives what the recorder's own command gives back after a stylesheet stalled and a module failed, in place of the lines. Each waits for its stall
// lines at most the wait limit it is given, 15 s unless the spec names another, and its run closes whatever happens, which stops its recorder's
// timer. Its lines go to its own run, not the spec run's output.
export class ScriptedStall {
  private static readonly SCENARIOS: readonly string[] = ["crowd", "alone", "many", "limit", "never", "answer"];
  private static readonly CHECK: number = 10;
  private static readonly LIMIT: number = 500;
  private static readonly WAIT_LIMIT: number = 15_000;
  private static readonly SCRIPTS: number = 21;
  private static readonly MANY: number = 23;
  private static readonly PRINTED: number = 20;
  private static readonly ORIGIN: string = "http://localhost:24316";
  private static readonly STALLED: string = "Stalled request at ";

  public readonly print: (context: unknown, scenario: string, waitLimit?: number) => Promise<readonly string[]> = async (_context, scenario, waitLimit = ScriptedStall.WAIT_LIMIT) => {
    if (!ScriptedStall.SCENARIOS.includes(scenario))
      throw new Error(`No scripted stall is named "${scenario}"; the names are ${ScriptedStall.SCENARIOS.join(", ")}.`);
    const page = new RecordedPage();
    const run = new RecordedRun();
    const stallLimit = scenario === "limit" ? ScriptedStall.LIMIT : scenario === "never" ? Number.POSITIVE_INFINITY : 0;
    const recorder = new FailedModuleRequests(new ConnectionProbe(), stallLimit, ScriptedStall.CHECK);
    const context = { page, project: { vitest: run } };
    recorder.watch(context);
    let answer: readonly string[] | null;
    try {
      answer = await ScriptedStall.playAsync(scenario, page, count => ScriptedStall.untilStalledAsync(run, count, waitLimit), () => recorder.watch(context));
    } finally {
      await run.closeAsync();
    }
    return answer ?? run.lines;
  };

  // Plays a scenario on the page, and gives the recorder's answer for "answer", or null to give the run's lines.
  private static async playAsync(scenario: string, page: RecordedPage, untilStalledAsync: (count: number) => Promise<void>, watch: () => readonly string[]): Promise<readonly string[] | null> {
    const script = (index: number, errorText: string | null = null): OpenRequest => new OpenRequest("script", `${ScriptedStall.ORIGIN}/chunk-${index}.js`, errorText);
    if (scenario === "many") {
      const scripts = Array.from({ length: ScriptedStall.MANY }, (_, i) => script(i));
      for (const request of scripts)
        page.open(request);
      await untilStalledAsync(ScriptedStall.PRINTED);
      for (const request of scripts)
        page.finish(request);
      return null;
    }
    const fetched = new OpenRequest("fetch", `${ScriptedStall.ORIGIN}/finished.json`);
    if (scenario === "limit") {
      page.open(fetched);
      page.finish(fetched);
    }
    const stylesheet = new OpenRequest("stylesheet", `${ScriptedStall.ORIGIN}/styles.css`);
    page.open(stylesheet);
    if (scenario === "alone" || scenario === "limit" || scenario === "never") {
      await untilStalledAsync(1);
      return null;
    }
    if (scenario === "answer") {
      await untilStalledAsync(1);
      page.fail(script(0, "net::ERR_ABORTED"));
      return watch();
    }
    page.open(fetched);
    page.finish(fetched);
    const first = script(0, "net::ERR_ABORTED");
    const scripts = [first, ...Array.from({ length: ScriptedStall.SCRIPTS - 1 }, (_, i) => script(i + 1, "net::ERR_ABORTED"))];
    for (const request of scripts)
      page.open(request);
    await untilStalledAsync(ScriptedStall.PRINTED);
    page.finish(stylesheet);
    page.fail(first);
    return null;
  }

  // Waits for the stall lines themselves, a check period at a time, and fails naming how many it saw once the wait limit has passed.
  private static async untilStalledAsync(run: RecordedRun, count: number, waitLimit: number): Promise<void> {
    const end = Date.now() + waitLimit;
    let printed = ScriptedStall.stallsIn(run);
    while (printed < count) {
      if (Date.now() >= end)
        throw new Error(`The recorder printed ${printed} of ${count} stall lines in ${waitLimit / 1000} s.`);
      await new Promise(resolve => setTimeout(resolve, ScriptedStall.CHECK));
      printed = ScriptedStall.stallsIn(run);
    }
  }

  private static stallsIn(run: RecordedRun): number {
    return run.lines.filter(t => t.startsWith(ScriptedStall.STALLED)).length;
  }
}
