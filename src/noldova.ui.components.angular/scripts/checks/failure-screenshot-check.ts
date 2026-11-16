/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import type { Writable } from "node:stream";

import type { ICheck } from "./interfaces/i-check.ts";
import type { ProcessResult } from "../process-result.ts";
import type { ProcessRunner } from "../processes/process-runner.ts";

// Runs Vitest's browser mode on a fixture whose one test fails with a title past what a file name may take, and checks that its failure screenshot is
// saved under a short name and that the run prints the long name beside the saved path. Vitest's own command would lose the screenshot to
// ENAMETOOLONG, so this fails if a Vitest update stops sending the failure screenshot through the command that tests/screenshots puts in its place.
export class FailureScreenshotCheck implements ICheck {
  private static readonly CLI: string = "node_modules/vitest/vitest.mjs";
  private static readonly FIXTURE: string = "src/noldova.ui.components.angular/tests/fixtures/failure-screenshot";
  private static readonly RUN_ARGUMENTS: readonly string[] = ["run", "--config", "vitest.config.mts"];
  private static readonly ATTACHMENTS_VARIABLE: string = "NOLDOVA_FAILURE_SCREENSHOT_ATTACHMENTS";
  // Under the repository, since Vitest saves a screenshot only inside the folders its server may serve.
  private static readonly ATTACHMENTS_SEGMENTS: readonly string[] = ["_build", "failure-screenshot-check"];
  private static readonly TIMEOUT: number = 300_000;
  private static readonly FAILED_RUN: number = 1;
  private static readonly SHORT_NAME: RegExp = /^[\da-f]{16}\.png$/u;
  private static readonly LOGGED: RegExp = /^Screenshot of "(?<name>[^"]+)": (?<path>.+)$/mu;
  private static readonly NAME_LIMIT: number = 255;

  private readonly root: string;
  private readonly runner: ProcessRunner;

  public readonly title: string = "Failure screenshots";

  public constructor(root: string, runner: ProcessRunner) {
    this.root = root;
    this.runner = runner;
  }

  public async runAsync(output: Writable): Promise<boolean> {
    const attachments = path.join(this.root, ...FailureScreenshotCheck.ATTACHMENTS_SEGMENTS);
    await rm(attachments, { recursive: true, force: true });
    await mkdir(attachments, { recursive: true });
    try {
      const result = await this.runner.captureAsync(process.execPath, [path.join(this.root, FailureScreenshotCheck.CLI), ...FailureScreenshotCheck.RUN_ARGUMENTS],
        path.join(this.root, FailureScreenshotCheck.FIXTURE), FailureScreenshotCheck.TIMEOUT, { ...process.env, [FailureScreenshotCheck.ATTACHMENTS_VARIABLE]: attachments });
      const files = (await readdir(attachments, { recursive: true, withFileTypes: true })).filter(t => t.isFile()).map(t => t.name);
      const findings = FailureScreenshotCheck.findingsOf(result, files);
      for (const finding of findings)
        output.write(`${finding}\n`);
      output.write(`Ran ${FailureScreenshotCheck.FIXTURE} in Vitest's browser mode and found ${files.length} failure screenshot files.\n`);
      return findings.length === 0;
    }
    finally {
      await rm(attachments, { recursive: true, force: true });
    }
  }

  private static findingsOf(result: ProcessResult, files: readonly string[]): readonly string[] {
    if (result.exitCode !== FailureScreenshotCheck.FAILED_RUN)
      return [`The fixture's run should fail its one test and exit with ${FailureScreenshotCheck.FAILED_RUN}, but exited with ${result.exitCode}:\n${result.text}`];
    const logged = FailureScreenshotCheck.LOGGED.exec(result.text)?.groups;
    const file = files.length === 1 ? files[0] : undefined;
    const findings: string[] = [];
    if (file === undefined || !FailureScreenshotCheck.SHORT_NAME.test(file))
      findings.push(`The failed test should leave one screenshot named with 16 hexadecimal digits, but left ${JSON.stringify(files)}:\n${result.text}`);
    if (logged?.["name"] === undefined || Buffer.byteLength(logged["name"]) <= FailureScreenshotCheck.NAME_LIMIT || path.basename(logged["path"] ?? "") !== file)
      findings.push(`The run should print "Screenshot of" the test's name, past ${FailureScreenshotCheck.NAME_LIMIT} bytes, beside the saved screenshot's path:\n${result.text}`);
    return findings;
  }
}
