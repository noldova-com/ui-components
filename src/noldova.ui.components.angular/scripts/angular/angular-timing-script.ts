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
import { LayoutTraceSuite } from "../../tests/fixtures/layout-trace-suite.ts";
import Config from "../config.ts";
import { TemporaryFolder } from "../processes/temporary-folder.ts";
import Script from "../script.ts";
import { AngularTestReport } from "./angular-test-report.ts";
import { AngularTestTiming } from "./angular-test-timing.ts";
import type { AngularTestTimingResult } from "./angular-test-timing-result.ts";
import { TimedTest } from "./timed-test.ts";
import { TimingCase } from "./timing-case.ts";
import { TimingPartCase } from "./timing-part-case.ts";

// The timing check's run loop, for the kit's and the docs site's specs alike: it checks itself on small reports, runs the project's specs several
// times without coverage, and judges their times. As npm test does, each run gives the tests that trace layout a browser of their own, since a
// trace records every tab of its browser and the suite's other tabs make it large enough to hold the browser past the next trace's wait.
export abstract class AngularTimingScript extends Script {
  private static readonly RUNS: number = 3;
  private static readonly ROOT: string = path.resolve(Config.ROOT);
  private static readonly ANGULAR_CLI_PATH: string = path.join(AngularTimingScript.ROOT, "node_modules/@angular/cli/bin/ng.js");
  private static readonly ANGULAR_TEST_ARGUMENTS: readonly string[] = ["--no-coverage", "--reporters=default", "--reporters=json", "--output-file"];
  private static readonly ANGULAR_TEST_COMMAND: string = "test";
  private static readonly ANGULAR_FILTER_OPTION: string = "--filter";
  private static readonly ANGULAR_INCLUDE_OPTION: string = "--include";
  private static readonly TIMING_FOLDER: string = "../../_build/timing";
  private static readonly DEPENDENCY_CACHE: string = "../../node_modules/.vite";
  private static readonly WORKSPACE_FOLDER: string = ".";
  private static readonly TEMPORARY_PREFIX: string = "test-timing-";
  private static readonly ENCODING: BufferEncoding = "utf8";
  private static readonly SUITE: string = "Suite";
  private static readonly PASSED: string = "passed";
  private static readonly FAILED: string = "failed";
  private static readonly SKIPPED: string = "skipped";
  private static readonly SELF_CHECK_PROJECT: string = "self-check";
  private static readonly SELF_CHECK: string = "The timing check checks itself on small reports in a temporary folder:";
  private static readonly SELF_CHECK_FAILED: string = "The timing check failed its own check, so it times nothing.";
  private static readonly SELECTION_CASE: string =
    "a workspace with a spec file that traces layout and one that doesn't runs every test outside the tracing suite first, then the suite from that file alone, "
    + "and spec files named by their file names run only those files, in the same parts";
  private static readonly TRACED_SPEC: string = "tests/traced.spec.ts";
  private static readonly UNTRACED_SPEC: string = "tests/untraced.spec.ts";

  private readonly project: string;
  private readonly owner: string;

  protected constructor(project: string, owner: string) {
    super();
    this.project = project;
    this.owner = owner;
  }

  // Spec files named by their file names, such as code-block-run.component.spec.ts, are the only ones timed; with none named, every spec file is.
  protected async runTimingAsync(specs: readonly string[] = []): Promise<void> {
    await this.writeLogAsync(AngularTimingScript.SELF_CHECK);
    let isSelfChecked = true;
    for (const check of AngularTimingScript.cases()) {
      const holds = await AngularTimingScript.runCaseAsync(check);
      isSelfChecked &&= holds;
      await this.writeLogAsync(`${holds ? "Holds" : "Fails"}: ${check.expectation}.`);
    }
    for (const check of AngularTimingScript.partCases()) {
      const holds = await AngularTimingScript.runPartCaseAsync(check);
      isSelfChecked &&= holds;
      await this.writeLogAsync(`${holds ? "Holds" : "Fails"}: ${check.expectation}.`);
    }
    const isSplit = await AngularTimingScript.runSelectionCaseAsync();
    isSelfChecked &&= isSplit;
    await this.writeLogAsync(`${isSplit ? "Holds" : "Fails"}: ${AngularTimingScript.SELECTION_CASE}.`);
    if (!isSelfChecked)
      throw new CommandFailedException(AngularTimingScript.SELF_CHECK_FAILED);

    const folder = path.resolve(AngularTimingScript.TIMING_FOLDER);
    await fs.mkdir(folder, { recursive: true });
    await fs.rm(AngularTimingScript.DEPENDENCY_CACHE, { recursive: true, force: true });
    const timing = new AngularTestTiming(AngularTimingScript.WORKSPACE_FOLDER);
    const tests = new AngularTestReport(AngularTimingScript.WORKSPACE_FOLDER, this.project);
    const parts = await AngularTimingScript.partsAsync(AngularTimingScript.WORKSPACE_FOLDER, tests, specs);
    for (let run = 1; run <= AngularTimingScript.RUNS; run++) {
      await this.writeLogAsync(`Timing run ${run} of ${AngularTimingScript.RUNS} of ${this.owner} specs...`);
      const reports: string[] = [];
      for (const [index, selection] of parts.entries()) {
        const report = path.join(folder, parts.length === 1 ? `${this.project}-${run}.json` : `${this.project}-${run}-${index + 1}.json`);
        await fs.rm(report, { force: true });
        try {
          await this.executeProcessAsync(process.execPath,
            [AngularTimingScript.ANGULAR_CLI_PATH, AngularTimingScript.ANGULAR_TEST_COMMAND, this.project, ...AngularTimingScript.ANGULAR_TEST_ARGUMENTS, report, ...selection],
            AngularTimingScript.WORKSPACE_FOLDER);
        }
        catch (error) {
          if (!(error instanceof CommandFailedException))
            throw error;
          await this.writeLogAsync(`Timing run ${run} of ${this.owner} specs failed; the timing check judges only passing specs.`);
          process.exitCode = 1;
          return;
        }
        reports.push(report);
      }
      const findings = await AngularTimingScript.checkRanOnceAsync(tests, reports);
      if (findings.length > 0) {
        for (const finding of findings)
          await this.writeLogAsync(finding);
        await this.writeLogAsync(`Timing run ${run} of ${this.owner} specs ran a test in none or more than one of its parts; the timing check times nothing.`);
        process.exitCode = 1;
        return;
      }
      for (const report of reports)
        await timing.readAsync(report);
    }

    const result = timing.judge();
    for (const line of result.lines)
      await this.writeLogAsync(line);
    if (result.over > 0)
      process.exitCode = 1;
  }

  // The test builder's selections for one timing run: one for every spec, or, when spec files trace layout, first every test outside the tracing
  // suite, then only the suite's tests from the files that hold it, each in a browser of its own.
  private static async partsAsync(folder: string, tests: AngularTestReport, specs: readonly string[] = []): Promise<readonly (readonly string[])[]> {
    const files = await tests.listSpecFilesAsync();
    const unknown = specs.filter(t => !files.some(u => path.posix.basename(u) === t));
    if (unknown.length > 0)
      throw new CommandFailedException(`No spec file is named ${unknown.join(", ")}; name each spec file to time by its file name, such as code-block-run.component.spec.ts.`);
    const chosen = specs.length === 0 ? files : files.filter(t => specs.includes(path.posix.basename(t)));
    const include = (selected: readonly string[]): readonly string[] => selected.flatMap(t => [AngularTimingScript.ANGULAR_INCLUDE_OPTION, t]);
    const traced: string[] = [];
    for (const spec of chosen)
      if ((await fs.readFile(path.resolve(folder, spec), AngularTimingScript.ENCODING)).includes(LayoutTraceSuite.mark))
        traced.push(spec);
    const named = specs.length === 0 ? [] : include(chosen);
    if (traced.length === 0)
      return [named];
    return [
      [`${AngularTimingScript.ANGULAR_FILTER_OPTION}=${LayoutTraceSuite.untracedFilter}`, ...named],
      [`${AngularTimingScript.ANGULAR_FILTER_OPTION}=${LayoutTraceSuite.title}`, ...include(traced)]
    ];
  }

  private static async checkRanOnceAsync(tests: AngularTestReport, reports: readonly string[]): Promise<readonly string[]> {
    const runs: ReadonlyMap<string, boolean>[] = [];
    for (const report of reports)
      runs.push(await tests.listRanAsync(report));
    return AngularTestReport.checkRanOnce(runs);
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

  private static partCases(): readonly TimingPartCase[] {
    const passed = (title: string): TimedTest => new TimedTest("parts.spec.ts", title, 10, AngularTimingScript.PASSED);
    const skipped = (title: string): TimedTest => new TimedTest("parts.spec.ts", title, 10, AngularTimingScript.SKIPPED);
    const names = (findings: readonly string[], text: string, title: string): boolean => findings.some(t => t.includes(text) && t.includes(`parts.spec.ts › ${AngularTimingScript.SUITE} › ${title}`));
    return [
      new TimingPartCase(
        "a run whose tests each ran in one of its two parts passes",
        [[passed("a"), skipped("b")], [skipped("a"), passed("b")]],
        findings => findings.length === 0
      ),
      new TimingPartCase(
        "a test that ran in both parts of a run fails, named",
        [[passed("a"), skipped("b")], [passed("a"), passed("b")]],
        findings => findings.length === 1 && names(findings, "more than one", "a")
      ),
      new TimingPartCase(
        "a test that ran in neither part of a run fails, named",
        [[passed("a"), skipped("c")], [skipped("a"), passed("b"), skipped("c")]],
        findings => findings.length === 1 && names(findings, "in none", "c")
      ),
      new TimingPartCase(
        "a run's second part that ran no test fails",
        [[passed("a"), passed("b")], [skipped("a"), skipped("b")]],
        findings => findings.length === 1 && findings.every(t => t.includes("Run 2") && t.includes("ran no test"))
      )
    ];
  }

  private static async runPartCaseAsync(check: TimingPartCase): Promise<boolean> {
    const temporary = new TemporaryFolder();
    const folder = await temporary.createAsync(process.platform, AngularTimingScript.TEMPORARY_PREFIX);
    try {
      const reports: string[] = [];
      for (const [index, tests] of check.parts.entries()) {
        const report = path.join(folder, `part-${index + 1}.json`);
        await fs.writeFile(report, AngularTimingScript.report(folder, tests), AngularTimingScript.ENCODING);
        reports.push(report);
      }
      return check.holds(await AngularTimingScript.checkRanOnceAsync(new AngularTestReport(folder, AngularTimingScript.SELF_CHECK_PROJECT), reports));
    }
    finally {
      await temporary.removeAsync(folder);
    }
  }

  // Runs the selections on a small workspace whose one spec file holds the tracing suite and whose other doesn't.
  private static async runSelectionCaseAsync(): Promise<boolean> {
    const temporary = new TemporaryFolder();
    const folder = await temporary.createAsync(process.platform, AngularTimingScript.TEMPORARY_PREFIX);
    try {
      const workspace = { projects: { [AngularTimingScript.SELF_CHECK_PROJECT]: { architect: { test: { options: { include: ["tests/**/*.spec.ts"] } } } } } };
      await fs.writeFile(path.join(folder, "angular.json"), JSON.stringify(workspace), AngularTimingScript.ENCODING);
      await fs.mkdir(path.join(folder, "tests"));
      await fs.writeFile(path.join(folder, AngularTimingScript.TRACED_SPEC), `${LayoutTraceSuite.mark}, () => {});\n`, AngularTimingScript.ENCODING);
      await fs.writeFile(path.join(folder, AngularTimingScript.UNTRACED_SPEC), "describe(\"Untraced\", () => {});\n", AngularTimingScript.ENCODING);
      const report = new AngularTestReport(folder, AngularTimingScript.SELF_CHECK_PROJECT);
      const tracedPart = [`${AngularTimingScript.ANGULAR_FILTER_OPTION}=${LayoutTraceSuite.title}`, AngularTimingScript.ANGULAR_INCLUDE_OPTION, AngularTimingScript.TRACED_SPEC];
      const selections = [
        [[], [[`${AngularTimingScript.ANGULAR_FILTER_OPTION}=${LayoutTraceSuite.untracedFilter}`], tracedPart]],
        [[path.posix.basename(AngularTimingScript.UNTRACED_SPEC)], [[AngularTimingScript.ANGULAR_INCLUDE_OPTION, AngularTimingScript.UNTRACED_SPEC]]],
        [[path.posix.basename(AngularTimingScript.TRACED_SPEC)],
          [[`${AngularTimingScript.ANGULAR_FILTER_OPTION}=${LayoutTraceSuite.untracedFilter}`, AngularTimingScript.ANGULAR_INCLUDE_OPTION, AngularTimingScript.TRACED_SPEC], tracedPart]]
      ] as const;
      for (const [specs, expected] of selections)
        if (JSON.stringify(await AngularTimingScript.partsAsync(folder, report, specs)) !== JSON.stringify(expected))
          return false;
      return await AngularTimingScript.partsAsync(folder, report, ["missing.spec.ts"]).then(() => false, (error: unknown) => error instanceof CommandFailedException);
    }
    finally {
      await temporary.removeAsync(folder);
    }
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
