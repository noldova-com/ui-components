/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fs from "node:fs/promises";
import path from "node:path";

import "@noldova/context.core";

import CommandFailedException from "../command-failed.exception.ts";
import type { IAngularFileResult } from "./interfaces/i-angular-file-result.ts";
import type { IAngularTestResult } from "./interfaces/i-angular-test-result.ts";

export class AngularTestReport {
  private static readonly WORKSPACE_FILE: string = "angular.json";
  private static readonly IDENTITY_SEPARATOR: string = " › ";
  private static readonly TEXT_ENCODING: BufferEncoding = "utf8";
  private static readonly MISSING_CODE: string = "ENOENT";
  private static readonly RAN_STATUSES: ReadonlySet<string> = new Set(["passed", "failed"]);

  private readonly folder: string;
  private readonly project: string;

  public constructor(folder: string, project: string) {
    this.folder = folder;
    this.project = project;
  }

  public async listSpecFilesAsync(): Promise<readonly string[]> {
    const workspace = JSON.parse(await fs.readFile(path.join(this.folder, AngularTestReport.WORKSPACE_FILE), AngularTestReport.TEXT_ENCODING)) as {
      readonly projects: Readonly<Record<string, { readonly architect: { readonly test?: { readonly options: { readonly include: readonly string[]; readonly exclude?: readonly string[] } } } }>>
    };
    const options = workspace.projects[this.project]?.architect.test?.options;
    if (Object.isUndefined(options) || options.include.length === 0 || !Object.isUndefined(options.exclude))
      throw new CommandFailedException(this.formatUnreadableWorkspace());

    const files: string[] = [];
    for await (const file of fs.glob([...options.include], { cwd: this.folder }))
      files.push(file.split(path.sep).join(path.posix.sep));
    return files.sort();
  }

  public async checkAsync(report: string, specs: readonly string[]): Promise<readonly string[]> {
    if (!await AngularTestReport.existsAsync(report))
      return [AngularTestReport.formatUnreported(specs)];
    const results = await AngularTestReport.readResultsAsync(report);
    const identities = new Set<string>();
    const repeated = new Set<string>();
    const reported = new Set<string>();
    for (const result of results) {
      const file = this.fileOf(result);
      reported.add(file);
      for (const test of result.assertionResults ?? []) {
        const identity = AngularTestReport.identityOf(file, test);
        if (identities.has(identity))
          repeated.add(identity);
        identities.add(identity);
      }
    }
    const unreported = specs.filter(t => !reported.has(t));
    return [
      ...unreported.length === 0 ? [] : [AngularTestReport.formatUnreported(unreported)],
      ...repeated.size === 0 ? [] : [AngularTestReport.formatRepeated([...repeated].sort())]];
  }

  public async listRanAsync(report: string): Promise<ReadonlyMap<string, boolean>> {
    const ran = new Map<string, boolean>();
    if (!await AngularTestReport.existsAsync(report))
      return ran;
    for (const result of await AngularTestReport.readResultsAsync(report)) {
      const file = this.fileOf(result);
      for (const test of result.assertionResults ?? []) {
        const identity = AngularTestReport.identityOf(file, test);
        ran.set(identity, ran.get(identity) === true || AngularTestReport.RAN_STATUSES.has(test.status));
      }
    }
    return ran;
  }

  public static checkRanOnce(runs: readonly ReadonlyMap<string, boolean>[]): readonly string[] {
    const counts = new Map<string, number>();
    for (const run of runs)
      for (const [identity, ran] of run)
        counts.set(identity, (counts.get(identity) ?? 0) + (ran ? 1 : 0));
    const never = [...counts].filter(([, count]) => count === 0).map(([identity]) => identity).sort();
    const again = [...counts].filter(([, count]) => count > 1).map(([identity]) => identity).sort();
    const idle = runs.flatMap((run, index) => index > 0 && ![...run.values()].includes(true) ? [index + 1] : []);
    return [
      ...never.length === 0 ? [] : [AngularTestReport.formatNeverRan(never)],
      ...again.length === 0 ? [] : [AngularTestReport.formatRanAgain(again)],
      ...idle.map(t => AngularTestReport.formatIdleRun(t, runs.length))];
  }

  private static async readResultsAsync(report: string): Promise<readonly IAngularFileResult[]> {
    return (JSON.parse(await fs.readFile(report, AngularTestReport.TEXT_ENCODING)) as { readonly testResults?: readonly IAngularFileResult[] }).testResults ?? [];
  }

  private fileOf(result: IAngularFileResult): string {
    return path.relative(this.folder, result.name).split(path.sep).join(path.posix.sep);
  }

  private static identityOf(file: string, test: IAngularTestResult): string {
    return [file, ...test.ancestorTitles, test.title].join(AngularTestReport.IDENTITY_SEPARATOR);
  }

  private static async existsAsync(file: string): Promise<boolean> {
    try {
      await fs.access(file);
      return true;
    }
    catch (error) {
      if (error instanceof Error && "code" in error && error.code === AngularTestReport.MISSING_CODE)
        return false;
      throw error;
    }
  }

  private formatUnreadableWorkspace(): string {
    return `${path.posix.join(this.folder.split(path.sep).join(path.posix.sep), AngularTestReport.WORKSPACE_FILE)} must name the spec files of the ${this.project} project's test target in include, with no exclude, so that every spec file is known to have run.`;
  }

  private static formatRepeated(identities: readonly string[]): string {
    return `The Angular tests repeat ${identities.length} test identities, which must be unique: ${identities.join(", ")}.`;
  }

  private static formatNeverRan(identities: readonly string[]): string {
    return `${identities.length} of the Angular tests ran in none of their runs, where each must run in exactly one: ${identities.join(", ")}.`;
  }

  private static formatRanAgain(identities: readonly string[]): string {
    return `${identities.length} of the Angular tests ran in more than one of their runs, where each must run in exactly one: ${identities.join(", ")}.`;
  }

  private static formatIdleRun(run: number, runs: number): string {
    return `Run ${run} of the Angular tests' ${runs} ran no test.`;
  }

  private static formatUnreported(specs: readonly string[]): string {
    return `The Angular tests reported no result for ${specs.length} spec files: ${specs.join(", ")}.`;
  }
}
