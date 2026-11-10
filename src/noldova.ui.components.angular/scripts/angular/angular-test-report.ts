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

export class AngularTestReport {
  private static readonly WORKSPACE_FILE: string = "angular.json";
  private static readonly IDENTITY_SEPARATOR: string = " › ";
  private static readonly TEXT_ENCODING: BufferEncoding = "utf8";

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
    if (options === undefined || options.include.length === 0 || options.exclude !== undefined)
      throw new CommandFailedException(this.formatUnreadableWorkspace());

    const files: string[] = [];
    for await (const file of fs.glob([...options.include], { cwd: this.folder }))
      files.push(file.split(path.sep).join(path.posix.sep));
    return files.sort();
  }

  public async checkAsync(report: string, specs: readonly string[]): Promise<readonly string[]> {
    if (!await AngularTestReport.existsAsync(report))
      return [AngularTestReport.formatUnreported(specs)];
    const results = (JSON.parse(await fs.readFile(report, AngularTestReport.TEXT_ENCODING)) as {
      readonly testResults?: readonly { readonly name: string; readonly assertionResults?: readonly { readonly ancestorTitles: readonly string[]; readonly title: string }[] }[]
    }).testResults ?? [];
    const identities = new Set<string>();
    const repeated = new Set<string>();
    const reported = new Set<string>();
    for (const result of results) {
      const file = path.relative(this.folder, result.name).split(path.sep).join(path.posix.sep);
      reported.add(file);
      for (const test of result.assertionResults ?? []) {
        const identity = [file, ...test.ancestorTitles, test.title].join(AngularTestReport.IDENTITY_SEPARATOR);
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

  private static async existsAsync(file: string): Promise<boolean> {
    try {
      await fs.access(file);
      return true;
    }
    catch {
      return false;
    }
  }

  private formatUnreadableWorkspace(): string {
    return `${path.posix.join(this.folder.split(path.sep).join(path.posix.sep), AngularTestReport.WORKSPACE_FILE)} must name the spec files of the ${this.project} project's test target in include, with no exclude, so that every spec file is known to have run.`;
  }

  private static formatRepeated(identities: readonly string[]): string {
    return `The Angular tests repeat ${identities.length} test identities, which must be unique: ${identities.join(", ")}.`;
  }

  private static formatUnreported(specs: readonly string[]): string {
    return `The Angular tests reported no result for ${specs.length} spec files: ${specs.join(", ")}.`;
  }
}
