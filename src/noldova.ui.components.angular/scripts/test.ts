/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from "node:fs/promises";
import path from "node:path";

import { AngularCoverageReport } from "./angular/angular-coverage-report.ts";
import { AngularTestReport } from "./angular/angular-test-report.ts";
import { CoverageMerge } from "./angular/coverage-merge.ts";
import { AngularNewestCheck } from "./checks/angular-newest-check.ts";
import { FailureScreenshotCheck } from "./checks/failure-screenshot-check.ts";
import type { ICheck } from "./checks/interfaces/i-check.ts";
import { KitBundleCheck } from "./checks/kit-bundle-check.ts";
import { KitCopiesCheck } from "./checks/kit-copies-check.ts";
import { KitManifestCheck } from "./checks/kit-manifest-check.ts";
import { NativeElementAssertionCheck } from "./checks/native-element-assertion-check.ts";
import { OnPushCheck } from "./checks/on-push-check.ts";
import { PollBoundCheck } from "./checks/poll-bound-check.ts";
import CommandFailedException from "./command-failed.exception.ts";
import Config from "./config.ts";
import { LayoutTraceSuite } from "../tests/fixtures/layout-trace-suite.ts";
import { ProcessRunner } from "./processes/process-runner.ts";
import { TemporaryFolder } from "./processes/temporary-folder.ts";
import Script from "./script.ts";

export class Test extends Script {
  private static readonly BLANK_LINE: string = "";
  private static readonly FILTERED_COVERAGE_SKIPPED: string = "Coverage gates, the nativeElement assertions check, the OnPush strategies check, the poll and test limits check, the Failure screenshots check, the Kit bundles, the Kit copies, the Kit manifest and Angular's newest skipped for a filtered run.";
  private static readonly NO_TEST_MATCHED: string = "No test matched the filters.";
  private static readonly KIT_CHECK_PLATFORM: NodeJS.Platform = "linux";
  private static readonly KIT_CHECK_ARCHITECTURE: NodeJS.Architecture = "x64";
  private static readonly KIT_CHECKS_SKIPPED: string = "The Kit bundles, the Kit copies, the Kit manifest and Angular's newest run only on Linux x64; skipped.";
  private static readonly OPTION_PREFIX: string = "--";
  private static readonly SHARD_PATTERN: RegExp = /^--shard=([1-8])\/([2-8])$/;
  private static readonly ACCEPTED_OPTIONS: readonly string[] = ["--skip-test-details", "--skip-coverage-details"];
  private static readonly ROOT: string = path.resolve(Config.ROOT);
  private static readonly ANGULAR_CLI_PATH: string = path.join(Test.ROOT, "node_modules/@angular/cli/bin/ng.js");
  private static readonly ANGULAR_PROJECT: string = "components";
  private static readonly ANGULAR_TEST_ARGUMENTS: readonly string[] = ["test", Test.ANGULAR_PROJECT, "--reporters=default", "--reporters=json", "--output-file"];
  private static readonly ANGULAR_REPORT_FILE: string = "../../_build/angular-tests.json";
  private static readonly ANGULAR_COVERAGE_FILE: string = "../../_build/angular-coverage/coverage-final.json";
  private static readonly COVERAGE_OWNER: string = "The kit's";
  private static readonly ANGULAR_SELECTION_OPTIONS: readonly string[] = ["--no-coverage"];
  private static readonly ANGULAR_PART_OPTIONS: readonly string[] = ["--configuration=part"];
  private static readonly ANGULAR_INCLUDE_OPTION: string = "--include";
  private static readonly ANGULAR_FILTER_OPTION: string = "--filter";
  private static readonly TRACED_SUITE: string = LayoutTraceSuite.title;
  private static readonly TRACED_MARK: string = LayoutTraceSuite.mark;
  private static readonly UNTRACED_FILTER: string = LayoutTraceSuite.untracedFilter;
  private static readonly TRACED_PART: string = "part-2";
  private static readonly UNTRACED_PART: string = "part-1";
  private static readonly PARTS_PREFIX: string = "kit-coverage-parts-";
  private static readonly COVERAGE_PART_FILE: string = "coverage-final.json";
  private static readonly DEPENDENCY_CACHE: string = "../../node_modules/.vite";
  private static readonly WORKSPACE_FOLDER: string = ".";
  private static readonly KIT_FOLDER: string = `src/${Config.KIT_INFO.path}`;

  private readonly report: AngularTestReport = new AngularTestReport(Test.WORKSPACE_FOLDER, Test.ANGULAR_PROJECT);
  private readonly coverage: AngularCoverageReport = new AngularCoverageReport(Test.WORKSPACE_FOLDER, Test.ANGULAR_COVERAGE_FILE, Test.COVERAGE_OWNER);
  private failed: boolean = false;

  public override async runAsync(): Promise<void> {
    const filters: string[] = [];
    let shard: { readonly part: number; readonly parts: number } | null = null;
    for (const argument of process.argv.slice(2)) {
      if (Test.ACCEPTED_OPTIONS.includes(argument))
        continue;
      const match = Test.SHARD_PATTERN.exec(argument);
      if (match !== null && shard === null && Number(match[1]) <= Number(match[2])) {
        shard = { part: Number(match[1]), parts: Number(match[2]) };
        continue;
      }
      if (argument.startsWith(Test.OPTION_PREFIX)) {
        await this.writeLogAsync(Test.unknownOption(argument));
        process.exitCode = 1;
        return;
      }
      filters.push(argument);
    }

    const isFiltered = filters.length > 0;
    if (!isFiltered && (shard === null || shard.part === 1)) {
      await this.runCheckAsync(new NativeElementAssertionCheck(Test.ROOT));
      await this.runCheckAsync(new OnPushCheck(Test.ROOT, new ProcessRunner()));
      await this.runCheckAsync(new PollBoundCheck(Test.ROOT));
      await this.runCheckAsync(new FailureScreenshotCheck(Test.ROOT, new ProcessRunner()));
      if (process.platform === Test.KIT_CHECK_PLATFORM && process.arch === Test.KIT_CHECK_ARCHITECTURE) {
        await this.runCheckAsync(new KitBundleCheck(Test.ROOT, new ProcessRunner()));
        await this.runCheckAsync(new KitCopiesCheck(Test.ROOT, new ProcessRunner(), new TemporaryFolder()));
        await this.runCheckAsync(new KitManifestCheck(Test.ROOT, new TemporaryFolder()));
        await this.runCheckAsync(new AngularNewestCheck(Test.ROOT, new ProcessRunner()));
      }
      else {
        await this.writeLogAsync(Test.BLANK_LINE);
        await this.writeLogAsync(Test.KIT_CHECKS_SKIPPED);
      }
    }
    const selected = await this.runAngularTestsAsync(filters, shard);

    if (shard !== null)
      await this.writeLogAsync(Test.partRun(shard.part, shard.parts, selected));
    if (isFiltered) {
      await this.writeLogAsync(Test.FILTERED_COVERAGE_SKIPPED);
      if (selected === 0) {
        await this.writeLogAsync(Test.NO_TEST_MATCHED);
        this.failed = true;
      }
    }

    if (this.failed)
      process.exitCode = 1;
  }

  private async runCheckAsync(check: ICheck): Promise<void> {
    await this.writeLogAsync(Test.BLANK_LINE);
    await this.writeLogAsync(check.title);
    if (!await check.runAsync(process.stdout))
      this.failed = true;
  }

  private async runAngularTestsAsync(filters: readonly string[], shard: { readonly part: number; readonly parts: number } | null): Promise<number> {
    const specs = await this.report.listSpecFilesAsync();
    const matched = filters.length === 0 ? specs : specs.filter(t => filters.some(u => `${Test.KIT_FOLDER}/${t}`.includes(u)));
    const selected = shard === null ? matched : matched.filter((_, index) => index % shard.parts === shard.part - 1);
    if (selected.length === 0)
      return 0;

    const traced: string[] = [];
    for (const spec of selected)
      if ((await this.readFileAsync(path.resolve(Test.WORKSPACE_FOLDER, spec))).includes(Test.TRACED_MARK))
        traced.push(spec);
    const isWhole = filters.length === 0 && shard === null;
    const keepsCoverage = filters.length === 0;
    const options = keepsCoverage ? Test.ANGULAR_PART_OPTIONS : Test.ANGULAR_SELECTION_OPTIONS;
    const parts = await new TemporaryFolder().createAsync(process.platform, Test.PARTS_PREFIX);
    try {
      await fs.rm(Test.DEPENDENCY_CACHE, { recursive: true, force: true });
      const runs = [await this.runAngularPartAsync(selected, isWhole ? [] : selected, options, Test.UNTRACED_FILTER, keepsCoverage ? path.join(parts, Test.UNTRACED_PART) : null)];
      if (traced.length > 0)
        runs.push(await this.runAngularPartAsync(traced, traced, options, Test.TRACED_SUITE, keepsCoverage ? path.join(parts, Test.TRACED_PART) : null));
      for (const finding of AngularTestReport.checkRanOnce(runs)) {
        await this.writeLogAsync(finding);
        this.failed = true;
      }
      if (keepsCoverage) {
        await new CoverageMerge(Test.ROOT, Test.KIT_FOLDER).mergeAsync(parts, traced.length > 0 ? 2 : 1, this.coverage.path);
        if (shard === null)
          for (const line of await this.coverage.listUnhitAsync()) {
            await this.writeLogAsync(line);
            this.failed = true;
          }
      }
    }
    finally {
      await new TemporaryFolder().removeAsync(parts);
    }
    return selected.length;
  }

  private async runAngularPartAsync(specs: readonly string[], included: readonly string[], options: readonly string[], filter: string, coverageFolder: string | null): Promise<ReadonlyMap<string, boolean>> {
    const report = path.resolve(Test.ANGULAR_REPORT_FILE);
    await fs.rm(report, { force: true });
    await fs.rm(this.coverage.path, { force: true });
    const selection = [...options, `${Test.ANGULAR_FILTER_OPTION}=${filter}`, ...included.flatMap(t => [Test.ANGULAR_INCLUDE_OPTION, t])];
    await this.writeLogAsync(Test.BLANK_LINE);
    await this.runCommandAsync(process.execPath, [Test.ANGULAR_CLI_PATH, ...Test.ANGULAR_TEST_ARGUMENTS, report, ...selection], path.resolve(Test.WORKSPACE_FOLDER));

    for (const finding of await this.report.checkAsync(report, specs)) {
      await this.writeLogAsync(finding);
      this.failed = true;
    }
    if (coverageFolder !== null) {
      await fs.mkdir(coverageFolder, { recursive: true });
      await fs.copyFile(this.coverage.path, path.join(coverageFolder, Test.COVERAGE_PART_FILE)).catch((error: unknown) => {
        throw new CommandFailedException(Test.coverageMissing(filter, this.coverage.path), { cause: error });
      });
    }
    return await this.report.listRanAsync(report);
  }

  private async runCommandAsync(command: string, arguments_: readonly string[], workingDirectory: string): Promise<void> {
    try {
      await this.executeProcessAsync(command, arguments_, workingDirectory);
    }
    catch (error) {
      if (!(error instanceof CommandFailedException))
        throw error;
      this.failed = true;
    }
  }

  private static unknownOption(option: string): string {
    return `Unknown option "${option}"; npm run test takes only filters and one --shard=<part>/<parts>, with 2 to 8 parts.`;
  }

  private static coverageMissing(filter: string, file: string): string {
    return `The kit's run of the tests named by ${filter} wrote no coverage at ${file}.`;
  }

  private static partRun(part: number, parts: number, specs: number): string {
    return `Part ${part} of ${parts} ran ${specs} of the kit's spec files and kept their coverage, which npm run test:merge gates with the other parts'; the checks before the specs run in part 1 alone.`;
  }
}

const test = new Test();
await test.runAsEntryPointAsync();
