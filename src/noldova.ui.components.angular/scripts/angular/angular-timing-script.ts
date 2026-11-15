/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from "node:fs/promises";
import path from "node:path";

import CommandFailedException from "../command-failed.exception.ts";
import Config from "../config.ts";
import { TemporaryFolder } from "../processes/temporary-folder.ts";
import Script from "../script.ts";
import { AngularTestTiming } from "./angular-test-timing.ts";
import type { AngularTestTimingResult } from "./angular-test-timing-result.ts";
import { TimedTest } from "./timed-test.ts";
import { TimingCase } from "./timing-case.ts";

// The timing check's run loop, for the kit's and the docs site's specs alike: it checks itself on small reports, runs the project's specs several
// times without coverage, and judges their times.
export abstract class AngularTimingScript extends Script {
  private static readonly RUNS: number = 3;
  private static readonly ROOT: string = path.resolve(Config.ROOT);
  private static readonly ANGULAR_CLI_PATH: string = path.join(AngularTimingScript.ROOT, "node_modules/@angular/cli/bin/ng.js");
  private static readonly ANGULAR_TEST_ARGUMENTS: readonly string[] = ["--no-coverage", "--reporters=default", "--reporters=json", "--output-file"];
  private static readonly ANGULAR_TEST_COMMAND: string = "test";
  private static readonly TIMING_FOLDER: string = "../../_build/timing";
  private static readonly DEPENDENCY_CACHE: string = "../../node_modules/.vite";
  private static readonly WORKSPACE_FOLDER: string = ".";
  private static readonly TEMPORARY_PREFIX: string = "test-timing-";
  private static readonly ENCODING: BufferEncoding = "utf8";
  private static readonly SUITE: string = "Suite";
  private static readonly PASSED: string = "passed";
  private static readonly FAILED: string = "failed";
  private static readonly SELF_CHECK: string = "The timing check checks itself on small reports in a temporary folder:";
  private static readonly SELF_CHECK_FAILED: string = "The timing check failed its own check, so it times nothing.";

  private readonly project: string;
  private readonly owner: string;

  protected constructor(project: string, owner: string) {
    super();
    this.project = project;
    this.owner = owner;
  }

  protected async runTimingAsync(): Promise<void> {
    await this.writeLogAsync(AngularTimingScript.SELF_CHECK);
    let isSelfChecked = true;
    for (const check of AngularTimingScript.cases()) {
      const holds = await AngularTimingScript.runCaseAsync(check);
      isSelfChecked &&= holds;
      await this.writeLogAsync(`${holds ? "Holds" : "Fails"}: ${check.expectation}.`);
    }
    if (!isSelfChecked)
      throw new CommandFailedException(AngularTimingScript.SELF_CHECK_FAILED);

    const folder = path.resolve(AngularTimingScript.TIMING_FOLDER);
    await fs.mkdir(folder, { recursive: true });
    await fs.rm(AngularTimingScript.DEPENDENCY_CACHE, { recursive: true, force: true });
    const timing = new AngularTestTiming(AngularTimingScript.WORKSPACE_FOLDER);
    for (let run = 1; run <= AngularTimingScript.RUNS; run++) {
      const report = path.join(folder, `${this.project}-${run}.json`);
      await fs.rm(report, { force: true });
      await this.writeLogAsync(`Timing run ${run} of ${AngularTimingScript.RUNS} of ${this.owner} specs...`);
      try {
        await this.executeProcessAsync(process.execPath,
          [AngularTimingScript.ANGULAR_CLI_PATH, AngularTimingScript.ANGULAR_TEST_COMMAND, this.project, ...AngularTimingScript.ANGULAR_TEST_ARGUMENTS, report],
          AngularTimingScript.WORKSPACE_FOLDER);
      }
      catch (error) {
        if (!(error instanceof CommandFailedException))
          throw error;
        await this.writeLogAsync(`Timing run ${run} of ${this.owner} specs failed; the timing check judges only passing specs.`);
        process.exitCode = 1;
        return;
      }
      await timing.readAsync(report);
    }

    const result = timing.judge();
    for (const line of result.lines)
      await this.writeLogAsync(line);
    if (result.over > 0)
      process.exitCode = 1;
  }

  private static cases(): readonly TimingCase[] {
    const timed = (file: string, title: string, duration: number, status: string = AngularTimingScript.PASSED): TimedTest => new TimedTest(file, title, duration, status);
    const isOver = (result: AngularTestTimingResult | null, file: string): boolean => result?.lines.some(t => t.startsWith(`Over: ${file},`)) ?? false;
    return [
      new TimingCase(
        "a spec file whose median test is within 100 ms passes, unnamed",
        [[timed("within.spec.ts", "a", 50), timed("within.spec.ts", "b", 90), timed("within.spec.ts", "c", 400)]],
        (result, failure) => failure === "" && result?.over === 0 && !isOver(result, "within.spec.ts")
      ),
      new TimingCase(
        "a spec file whose median test is over 100 ms and its margin of 20% fails, named",
        [[timed("over.spec.ts", "a", 130), timed("over.spec.ts", "b", 130)], [timed("within.spec.ts", "a", 10)]],
        (result, failure) => failure === "" && result?.over === 1 && isOver(result, "over.spec.ts") && !isOver(result, "within.spec.ts")
      ),
      new TimingCase(
        "a spec file inside the margin passes",
        [[timed("margin.spec.ts", "a", 115)]],
        (result, failure) => failure === "" && result?.over === 0
      ),
      new TimingCase(
        "each test's time is its median over the runs, not its slowest run",
        [[timed("runs.spec.ts", "a", 90)], [timed("runs.spec.ts", "a", 900)], [timed("runs.spec.ts", "a", 95)]],
        (result, failure) => failure === "" && result?.over === 0
      ),
      new TimingCase(
        "a test over 1 second is listed with its time, though its file is within the budget",
        [[timed("listed.spec.ts", "fast", 10), timed("listed.spec.ts", "slow", 1500), timed("listed.spec.ts", "quick", 20)]],
        (result, failure) => failure === "" && result?.over === 0
          && result.lines.some(t => t.includes(`listed.spec.ts › ${AngularTimingScript.SUITE} › slow, 1500 ms`))
      ),
      new TimingCase(
        "a failed test's time is left out",
        [[timed("failed.spec.ts", "a", 10), timed("failed.spec.ts", "b", 5000, AngularTimingScript.FAILED)]],
        (result, failure) => failure === "" && result?.over === 0 && !result.lines.some(t => t.includes("failed.spec.ts ›"))
      ),
      new TimingCase(
        "a spec file missing from a run is judged on the runs that hold it",
        [[timed("missing.spec.ts", "a", 300)], [timed("other.spec.ts", "a", 10)]],
        (result, failure) => failure === "" && result?.over === 1 && isOver(result, "missing.spec.ts")
      ),
      new TimingCase(
        "a run that wrote no report fails, naming the report",
        [[timed("within.spec.ts", "a", 10)], null],
        (_, failure) => failure.includes("run-2.json is missing")
      )
    ];
  }

  private static async runCaseAsync(check: TimingCase): Promise<boolean> {
    const temporary = new TemporaryFolder();
    const folder = await temporary.createAsync(process.platform, AngularTimingScript.TEMPORARY_PREFIX);
    try {
      const timing = new AngularTestTiming(folder);
      let failure = "";
      try {
        for (const [index, tests] of check.runs.entries()) {
          const report = path.join(folder, `run-${index + 1}.json`);
          if (tests !== null)
            await fs.writeFile(report, AngularTimingScript.report(folder, tests), AngularTimingScript.ENCODING);
          await timing.readAsync(report);
        }
      }
      catch (error) {
        if (!(error instanceof CommandFailedException))
          throw error;
        failure = error.message;
      }
      return check.holds(failure === "" ? timing.judge() : null, failure);
    }
    finally {
      await temporary.removeAsync(folder);
    }
  }

  private static report(folder: string, tests: readonly TimedTest[]): string {
    const files = [...new Set(tests.map(t => t.file))];
    return JSON.stringify({
      testResults: files.map(file => ({
        name: path.join(folder, file),
        assertionResults: tests.filter(t => t.file === file)
          .map(t => ({ ancestorTitles: [AngularTimingScript.SUITE], title: t.title, status: t.status, duration: t.duration }))
      }))
    });
  }
}
