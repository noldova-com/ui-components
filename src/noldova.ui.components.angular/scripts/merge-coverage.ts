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
import { CoverageMerge } from "./angular/coverage-merge.ts";
import CommandFailedException from "./command-failed.exception.ts";
import Config from "./config.ts";
import { TemporaryFolder } from "./processes/temporary-folder.ts";
import Script from "./script.ts";

interface IMergeCase {
  readonly expectation: string;
  readonly parts: number;
  readonly files: Readonly<Record<string, string | null>>;
  readonly holds: (unhit: readonly string[], failure: string) => boolean;
}

export class MergeCoverage extends Script {
  private static readonly KIT_FOLDER: string = `src/${Config.KIT_INFO.path}`;
  private static readonly ROOT: string = path.resolve(Config.ROOT);
  private static readonly COVERAGE_FILE: string = "../../_build/angular-coverage/coverage-final.json";
  private static readonly COVERAGE_OWNER: string = "The kit's";
  private static readonly WORKSPACE_FOLDER: string = ".";
  private static readonly PARTS_PATTERN: RegExp = /^[2-8]$/u;
  private static readonly PART_FILE: string = "coverage-final.json";
  private static readonly SOURCE_FILE: string = "src/app/sample.ts";
  private static readonly TEMPORARY_PREFIX: string = "coverage-merge-";
  private static readonly ENCODING: BufferEncoding = "utf8";
  private static readonly USAGE: string = "Usage: npm run test:merge -- <folder of the parts' coverage> <parts, 2 to 8>.";
  private static readonly SELF_CHECK: string = "The coverage merge checks itself on small reports in a temporary folder:";
  private static readonly SELF_CHECK_FAILED: string = "The coverage merge failed its own check, so it merges nothing.";
  private static readonly GATE_FAILED: string = "The kit's merged coverage is under 100%.";

  public async runAsync(): Promise<void> {
    const [folder, parts, ...rest] = process.argv.slice(2);
    if (folder === undefined || parts === undefined || !MergeCoverage.PARTS_PATTERN.test(parts) || rest.length > 0)
      throw new CommandFailedException(MergeCoverage.USAGE);

    await this.writeLogAsync(MergeCoverage.SELF_CHECK);
    let isSelfChecked = true;
    for (const check of MergeCoverage.cases()) {
      const holds = await MergeCoverage.runCaseAsync(check);
      isSelfChecked &&= holds;
      await this.writeLogAsync(`${holds ? "Holds" : "Fails"}: ${check.expectation}.`);
    }
    if (!isSelfChecked)
      throw new CommandFailedException(MergeCoverage.SELF_CHECK_FAILED);

    await new CoverageMerge(MergeCoverage.ROOT, MergeCoverage.KIT_FOLDER).mergeAsync(path.resolve(folder), Number(parts), path.resolve(MergeCoverage.COVERAGE_FILE));
    const unhit = await new AngularCoverageReport(MergeCoverage.WORKSPACE_FOLDER, MergeCoverage.COVERAGE_FILE, MergeCoverage.COVERAGE_OWNER).listUnhitAsync();
    for (const line of unhit)
      await this.writeLogAsync(line);
    if (unhit.length > 0)
      throw new CommandFailedException(MergeCoverage.GATE_FAILED);
    await this.writeLogAsync(MergeCoverage.merged(Number(parts)));
  }

  private static cases(): readonly IMergeCase[] {
    const first = MergeCoverage.report("/a", [0, 1], [1, 0], 1, [1, 0]);
    const second = MergeCoverage.report("/b/c", [1, 0], [0, 1], 0, [0, 1]);
    const secondUnhit = MergeCoverage.report("/b/c", [1, 0], [0, 0], 0, [0, 1]);
    return [
      { expectation: "two parts that each reach half of a file, numbered apart and from other folders, reach all of it together", parts: 2, files: { "part-1": first, "part-2": second }, holds: (unhit, failure) => failure === "" && unhit.length === 0 },
      { expectation: "a statement neither part reaches is named by its file, line and column", parts: 2, files: { "part-1": first, "part-2": secondUnhit }, holds: (unhit, failure) => failure === "" && unhit.some(t => t.endsWith(`statement at ${MergeCoverage.SOURCE_FILE}:2:1`)) },
      { expectation: "fewer parts than the run had fail, naming how many came", parts: 3, files: { "part-1": first, "part-2": second }, holds: (_, failure) => failure.includes("2 parts, not 3") },
      { expectation: "a part without its report fails, naming the part", parts: 2, files: { "part-1": first, "part-2": null }, holds: (_, failure) => failure.includes("part part-2") },
      { expectation: "a part whose report isn't JSON fails", parts: 2, files: { "part-1": first, "part-2": "{" }, holds: (_, failure) => failure.includes("is not JSON") }
    ];
  }

  private static async runCaseAsync(check: IMergeCase): Promise<boolean> {
    const temporary = new TemporaryFolder();
    const folder = await temporary.createAsync(process.platform, MergeCoverage.TEMPORARY_PREFIX);
    try {
      for (const [name, text] of Object.entries(check.files)) {
        await fs.mkdir(path.join(folder, "parts", name), { recursive: true });
        if (text !== null)
          await fs.writeFile(path.join(folder, "parts", name, MergeCoverage.PART_FILE), text, MergeCoverage.ENCODING);
      }
      const root = path.join(folder, "root");
      const output = path.join(folder, MergeCoverage.PART_FILE);
      let failure = "";
      try {
        await new CoverageMerge(root, MergeCoverage.KIT_FOLDER).mergeAsync(path.join(folder, "parts"), check.parts, output);
      }
      catch (error) {
        failure = error instanceof Error ? error.message : String(error);
      }
      const unhit = failure === "" ? await new AngularCoverageReport(path.join(root, MergeCoverage.KIT_FOLDER), output, MergeCoverage.COVERAGE_OWNER).listUnhitAsync() : [];
      return check.holds(unhit, failure);
    }
    finally {
      await temporary.removeAsync(folder);
    }
  }

  private static report(root: string, order: readonly number[], statementHits: readonly number[], functionHits: number, branchHits: readonly number[]): string {
    const filePath = `${root}/${MergeCoverage.KIT_FOLDER}/${MergeCoverage.SOURCE_FILE}`;
    const ranges = [MergeCoverage.range(1), MergeCoverage.range(2)];
    return JSON.stringify({
      [filePath]: {
        path: filePath,
        statementMap: Object.fromEntries(order.map((t, index) => [String(index), ranges[t]])),
        s: Object.fromEntries(order.map((t, index) => [String(index), statementHits[t]])),
        fnMap: { 0: { name: "run", decl: MergeCoverage.range(1), loc: MergeCoverage.range(1), line: 1 } },
        f: { 0: functionHits },
        branchMap: { 0: { loc: MergeCoverage.range(2), type: "if", locations: [MergeCoverage.range(2), MergeCoverage.range(2)], line: 2 } },
        b: { 0: branchHits }
      }
    });
  }

  private static range(line: number): object {
    return { start: { line, column: 0 }, end: { line, column: 10 } };
  }

  private static merged(parts: number): string {
    return `The kit's coverage, merged from its ${parts} parts, reaches every function, statement and branch.`;
  }
}

const merge = new MergeCoverage();
await merge.runAsEntryPointAsync();
