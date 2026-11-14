/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * The timing check of the docs site's specs, the kit's own check applied to
 * them: it runs them three times without coverage, takes each test's median
 * time, and fails a spec file whose median test exceeds 100 ms plus a margin
 * of 20%, printing each test over 1 second. Like the docs site's tests in
 * npm test, it runs only on Linux, after npm test has built the kit.
 *
 * @example
 * npm run test:timing - runs the docs site's specs three times and judges each spec file's median test.
 */

import fs from "node:fs/promises";
import path from "node:path";

import { AngularTestTiming } from "../../noldova.ui.components.angular/scripts/angular/angular-test-timing.ts";
import CommandFailedException from "../../noldova.ui.components.angular/scripts/command-failed.exception.ts";
import Config from "../../noldova.ui.components.angular/scripts/config.ts";
import Script from "../../noldova.ui.components.angular/scripts/script.ts";

import { DocsPreparation } from "./docs/docs-preparation.ts";

export class TestDocsTiming extends Script {
  private static readonly RUNS: number = 3;
  private static readonly ROOT: string = path.resolve(Config.ROOT);
  private static readonly ANGULAR_CLI_PATH: string = path.join(TestDocsTiming.ROOT, "node_modules/@angular/cli/bin/ng.js");
  private static readonly ANGULAR_PROJECT: string = "docs";
  private static readonly ANGULAR_TEST_ARGUMENTS: readonly string[] = ["test", TestDocsTiming.ANGULAR_PROJECT, "--no-coverage", "--reporters=default", "--reporters=json", "--output-file"];
  private static readonly TIMING_FOLDER: string = "../../_build/timing";
  private static readonly DEPENDENCY_CACHE: string = "../../node_modules/.vite";
  private static readonly WORKSPACE_FOLDER: string = ".";
  private static readonly PLATFORM: NodeJS.Platform = "linux";
  private static readonly SKIPPED_OFF_PLATFORM: string = "The docs site's timing check runs only on Linux, as its tests do; skipped.";

  public override async runAsync(): Promise<void> {
    if (process.platform !== TestDocsTiming.PLATFORM) {
      await this.writeLogAsync(TestDocsTiming.SKIPPED_OFF_PLATFORM);
      return;
    }

    await new DocsPreparation(TestDocsTiming.ROOT).prepareAsync(process.stdout);
    const folder = path.resolve(TestDocsTiming.TIMING_FOLDER);
    await fs.mkdir(folder, { recursive: true });
    await fs.rm(TestDocsTiming.DEPENDENCY_CACHE, { recursive: true, force: true });
    const timing = new AngularTestTiming(TestDocsTiming.WORKSPACE_FOLDER);
    for (let run = 1; run <= TestDocsTiming.RUNS; run++) {
      const report = path.join(folder, `${TestDocsTiming.ANGULAR_PROJECT}-${run}.json`);
      await fs.rm(report, { force: true });
      await this.writeLogAsync(TestDocsTiming.startingRun(run));
      try {
        await this.executeProcessAsync(process.execPath, [TestDocsTiming.ANGULAR_CLI_PATH, ...TestDocsTiming.ANGULAR_TEST_ARGUMENTS, report], TestDocsTiming.WORKSPACE_FOLDER);
      }
      catch (error) {
        if (!(error instanceof CommandFailedException))
          throw error;
        await this.writeLogAsync(TestDocsTiming.runFailed(run));
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
    return `Timing run ${run} of ${TestDocsTiming.RUNS} of the docs site's specs...`;
  }

  private static runFailed(run: number): string {
    return `Timing run ${run} of the docs site's specs failed; the timing check judges only passing specs.`;
  }
}

const timing = new TestDocsTiming();
await timing.runAsEntryPointAsync();
