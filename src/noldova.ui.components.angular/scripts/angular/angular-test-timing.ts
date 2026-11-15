/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from "node:fs/promises";
import path from "node:path";

import { TestTimingCheck } from "@noldova/context.testing";

import CommandFailedException from "../command-failed.exception.ts";
import { AngularTestTimingResult } from "./angular-test-timing-result.ts";
import { JsonFields } from "./json-fields.ts";

// Judges spec files by their tests' times over several runs, as the testing standard asks of component specs: each test's time is the median
// of its runs, and a file fails when the median of its tests' times exceeds 100 ms plus the margin. Each test over 1 second is printed, since
// README lists each one with its time and cause.
export class AngularTestTiming {
  private static readonly SPEC_MEDIAN_BUDGET_MILLISECONDS: number = 100;
  private static readonly MARGIN: number = 0.2;
  private static readonly SLOW_TEST_MILLISECONDS: number = 1_000;
  private static readonly TEXT_ENCODING: BufferEncoding = "utf8";
  private static readonly MISSING_CODE: string = "ENOENT";
  private static readonly IDENTITY_SEPARATOR: string = " › ";
  private static readonly PASSED: string = "passed";
  private static readonly FILES_FIELD: string = "testResults";
  private static readonly FILE_NAME_FIELD: string = "name";
  private static readonly TESTS_FIELD: string = "assertionResults";
  private static readonly ANCESTORS_FIELD: string = "ancestorTitles";
  private static readonly TITLE_FIELD: string = "title";
  private static readonly STATUS_FIELD: string = "status";
  private static readonly DURATION_FIELD: string = "duration";

  private readonly folder: string;
  private readonly times: Map<string, Map<string, number[]>> = new Map<string, Map<string, number[]>>();

  public constructor(folder: string) {
    this.folder = folder;
  }

  public async readAsync(report: string): Promise<void> {
    const files = JsonFields.parse(await AngularTestTiming.readReportAsync(report), report).objects(AngularTestTiming.FILES_FIELD);
    for (const file of files) {
      const name = path.relative(this.folder, file.text(AngularTestTiming.FILE_NAME_FIELD)).split(path.sep).join(path.posix.sep);
      const tests = this.times.get(name) ?? new Map<string, number[]>();
      for (const test of file.objects(AngularTestTiming.TESTS_FIELD)) {
        if (test.text(AngularTestTiming.STATUS_FIELD) !== AngularTestTiming.PASSED)
          continue;
        const identity = [...test.texts(AngularTestTiming.ANCESTORS_FIELD), test.text(AngularTestTiming.TITLE_FIELD)].join(AngularTestTiming.IDENTITY_SEPARATOR);
        tests.set(identity, [...tests.get(identity) ?? [], test.number(AngularTestTiming.DURATION_FIELD)]);
      }
      this.times.set(name, tests);
    }
  }

  public judge(): AngularTestTimingResult {
    const lines: string[] = [];
    let over = 0;
    for (const [file, tests] of [...this.times].sort(([left], [right]) => left.localeCompare(right))) {
      const median = TestTimingCheck.median([...tests.values()].map(t => TestTimingCheck.median(t) ?? 0)) ?? 0;
      const isOver = median > AngularTestTiming.SPEC_MEDIAN_BUDGET_MILLISECONDS * (1 + AngularTestTiming.MARGIN);
      over += Number(isOver);
      if (isOver)
        lines.push(AngularTestTiming.formatOver(file, median, tests.size));
      for (const [test, times] of tests) {
        const time = TestTimingCheck.median(times) ?? 0;
        if (time > AngularTestTiming.SLOW_TEST_MILLISECONDS)
          lines.push(AngularTestTiming.formatSlowTest(file, test, time));
      }
    }
    lines.push(AngularTestTiming.formatSummary(this.times.size, over));
    return new AngularTestTimingResult(lines, over);
  }

  private static async readReportAsync(report: string): Promise<string> {
    try {
      return await fs.readFile(report, AngularTestTiming.TEXT_ENCODING);
    }
    catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== AngularTestTiming.MISSING_CODE)
        throw error;
      throw new CommandFailedException(`${report} is missing: the test run wrote no JSON report there.`, { cause: error });
    }
  }

  private static formatOver(file: string, median: number, tests: number): string {
    return `Over: ${file}, median test ${median.toFixed(1)} ms over ${tests} tests, over the ${AngularTestTiming.SPEC_MEDIAN_BUDGET_MILLISECONDS} ms a component spec file's median test may take, with its margin of ${AngularTestTiming.MARGIN * 100}%.`;
  }

  private static formatSlowTest(file: string, test: string, time: number): string {
    return `  Over 1 second: ${file} › ${test}, ${Math.round(time)} ms; README lists each such test with its time and cause.`;
  }

  private static formatSummary(files: number, over: number): string {
    return `Timed ${files} spec files: ${over} over the ${AngularTestTiming.SPEC_MEDIAN_BUDGET_MILLISECONDS} ms median test, with its margin. Each test's time is the median of its runs.`;
  }
}
