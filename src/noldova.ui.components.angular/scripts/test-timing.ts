/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * The timing check of the kit's specs, kept apart from npm test since its pass
 * condition is a time: it runs the specs three times without coverage, takes
 * each test's median time, so one slow run decides nothing, and fails a spec
 * file whose median test exceeds 100 ms plus a margin of 20%. It prints each
 * test over 1 second, which README lists. Run it on a test machine: a busy
 * machine measures its load rather than the specs.
 *
 * @example
 * npm run test:timing - runs the kit's specs three times and judges each spec file's median test.
 */

import fs from "node:fs/promises";
import path from "node:path";

import { AngularTestTiming } from "./angular/angular-test-timing.ts";
import CommandFailedException from "./command-failed.exception.ts";
import Config from "./config.ts";
import Script from "./script.ts";

export class TestTiming extends Script {
  private static readonly RUNS: number = 3;
  private static readonly ROOT: string = path.resolve(Config.ROOT);
  private static readonly ANGULAR_CLI_PATH: string = path.join(TestTiming.ROOT, "node_modules/@angular/cli/bin/ng.js");
  private static readonly ANGULAR_PROJECT: string = "components";
  private static readonly ANGULAR_TEST_ARGUMENTS: readonly string[] = ["test", TestTiming.ANGULAR_PROJECT, "--no-coverage", "--reporters=default", "--reporters=json", "--output-file"];
  private static readonly TIMING_FOLDER: string = "../../_build/timing";
  private static readonly DEPENDENCY_CACHE: string = "../../node_modules/.vite";
  private static readonly WORKSPACE_FOLDER: string = ".";

  public override async runAsync(): Promise<void> {
    const folder = path.resolve(TestTiming.TIMING_FOLDER);
    await fs.mkdir(folder, { recursive: true });
    await fs.rm(TestTiming.DEPENDENCY_CACHE, { recursive: true, force: true });
    const timing = new AngularTestTiming(TestTiming.WORKSPACE_FOLDER);
    for (let run = 1; run <= TestTiming.RUNS; run++) {
      const report = path.join(folder, `${TestTiming.ANGULAR_PROJECT}-${run}.json`);
      await fs.rm(report, { force: true });
      await this.writeLogAsync(TestTiming.startingRun(run));
      try {
        await this.executeProcessAsync(process.execPath, [TestTiming.ANGULAR_CLI_PATH, ...TestTiming.ANGULAR_TEST_ARGUMENTS, report], TestTiming.WORKSPACE_FOLDER);
      }
      catch (error) {
        if (!(error instanceof CommandFailedException))
          throw error;
        await this.writeLogAsync(TestTiming.runFailed(run));
        process.exitCode = 1;
        return;
      }
      await timing.readAsync(report);
    }

    const { lines, over } = timing.judge();
    for (const line of lines)
      await this.writeLogAsync(line);
    if (over > 0)
      process.exitCode = 1;
  }

  private static startingRun(run: number): string {
    return `Timing run ${run} of ${TestTiming.RUNS} of the kit's specs...`;
  }

  private static runFailed(run: number): string {
    return `Timing run ${run} of the kit's specs failed; the timing check judges only passing specs.`;
  }
}

const timing = new TestTiming();
await timing.runAsEntryPointAsync();
