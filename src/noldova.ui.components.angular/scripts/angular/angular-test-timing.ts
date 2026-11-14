/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from "node:fs/promises";
import path from "node:path";

import { JsonFields } from "./json-fields.ts";

// Judges spec files by their tests' times over several runs, as the testing standard asks of component specs: each test's time is the median
// of its runs, and a file fails when the median of its tests' times exceeds 100 ms plus the margin. Each test over 1 second is printed, since
// README lists each one with its time and cause.
export class AngularTestTiming {
  private static readonly SPEC_MEDIAN_BUDGET_MILLISECONDS: number = 100;
  private static readonly MARGIN: number = 0.2;
  private static readonly SLOW_TEST_MILLISECONDS: number = 1_000;
  private static readonly TEXT_ENCODING: BufferEncoding = "utf8";
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

  public static median(values: readonly number[]): number {
    const sorted = [...values].sort((left, right) => left - right);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 1 ? sorted[middle] ?? 0 : ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
  }

  public async readAsync(report: string): Promise<void> {
    const files = JsonFields.parse(await fs.readFile(report, AngularTestTiming.TEXT_ENCODING), report).objects(AngularTestTiming.FILES_FIELD);
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

  // Returns the lines to print and the number of files over the budget.
  public judge(): { readonly lines: readonly string[]; readonly over: number } {
    const lines: string[] = [];
    let over = 0;
    for (const [file, tests] of [...this.times].sort(([left], [right]) => left.localeCompare(right))) {
      const median = AngularTestTiming.median([...tests.values()].map(t => AngularTestTiming.median(t)));
      const isOver = median > AngularTestTiming.SPEC_MEDIAN_BUDGET_MILLISECONDS * (1 + AngularTestTiming.MARGIN);
      over += Number(isOver);
      if (isOver)
        lines.push(AngularTestTiming.formatOver(file, median, tests.size));
      for (const [test, times] of tests) {
        const time = AngularTestTiming.median(times);
        if (time > AngularTestTiming.SLOW_TEST_MILLISECONDS)
          lines.push(AngularTestTiming.formatSlowTest(file, test, time));
      }
    }
    lines.push(AngularTestTiming.formatSummary(this.times.size, over));
    return { lines, over };
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
