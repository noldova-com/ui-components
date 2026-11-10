/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { existsSync } from "node:fs";
import path from "node:path";
import type { Writable } from "node:stream";

import { ApiDocMerger } from "./api/api-doc-merger.ts";
import { ApiProgram } from "./api/api-program.ts";
import { ApiProject } from "./api/api-project.ts";
import { ApiException } from "./api/api.exception.ts";
import CommandFailedException from "./command-failed.exception.ts";

export class CarryDocs {
  private static readonly USAGE: string = "Usage: node src/noldova.ui.components.angular/scripts/carry-docs.ts <Angular project file> <compiled package folder> <entry file>..., run from the repository's root\n";
  private static readonly USAGE_EXIT_CODE: number = 2;
  private static readonly PURPOSE: string = "declaration-docs";
  private static readonly ENTRY_FOLDER: string = "api";
  private static readonly SCRIPT_EXTENSION: string = ".ts";
  private static readonly DECLARATIONS: string = ".d.ts";
  private static readonly RULE: string = "Each export and public member of an entry is declared and documented in its src/api/<entry>.d.ts.";

  private readonly root: string;
  private readonly output: Writable;

  public constructor(root: string, output: Writable) {
    this.root = root;
    this.output = output;
  }

  public async runAsync(args: readonly string[]): Promise<number> {
    const [projectFile, output, ...entries] = args;
    if (projectFile === undefined || output === undefined || entries.length === 0) {
      this.output.write(CarryDocs.USAGE);
      return CarryDocs.USAGE_EXIT_CODE;
    }

    try {
      await this.carryAsync(path.resolve(projectFile), path.resolve(output), entries.map(t => path.resolve(t)));
      return 0;
    }
    catch (error) {
      if (!(error instanceof CommandFailedException))
        throw error;
      this.output.write(`${error.message}\n`);
      return 1;
    }
  }

  private async carryAsync(projectFile: string, output: string, entries: readonly string[]): Promise<void> {
    const pairs = entries.map(t => {
      const name = path.basename(t, CarryDocs.SCRIPT_EXTENSION);
      return [path.join(path.dirname(t), `${name}${CarryDocs.DECLARATIONS}`), path.join(output, CarryDocs.ENTRY_FOLDER, `${name}${CarryDocs.DECLARATIONS}`)] as const;
    });
    for (const [documented, compiled] of pairs) {
      if (!existsSync(documented))
        throw new CommandFailedException(`${this.describe(documented)} is missing; each entry's documented declarations sit beside it.`);
      if (!existsSync(compiled))
        throw new CommandFailedException(`The Angular compiler wrote no ${this.describe(compiled)} for ${this.describe(documented)}.`);
    }

    const project = new ApiProject(this.root, CarryDocs.PURPOSE, path.basename(output));
    await project.writeAsync(projectFile, this.root, pairs.flat());
    const merger = this.merge(project.file, output, pairs);
    const problems = merger.problems;
    if (problems.length > 0)
      throw new CommandFailedException(`The compiled declarations in ${this.describe(output)} differ from the documented ones:\n${problems.map(t => `  ${t}\n`).join("")}${CarryDocs.RULE}`);
    await merger.writeAsync();
  }

  private merge(projectFile: string, output: string, pairs: readonly (readonly [string, string])[]): ApiDocMerger {
    try {
      const merger = new ApiDocMerger(ApiProgram.open(projectFile), this.root);
      for (const [documented, compiled] of pairs)
        merger.add(documented, compiled);
      return merger;
    }
    catch (error) {
      if (error instanceof ApiException)
        throw new CommandFailedException(`Carrying the documented declarations onto ${this.describe(output)} failed: ${error.message}`, { cause: error });
      throw error;
    }
  }

  private describe(file: string): string {
    return path.relative(this.root, file).split(path.sep).join(path.posix.sep);
  }
}

if (import.meta.main)
  process.exitCode = await new CarryDocs(process.cwd(), process.stderr).runAsync(process.argv.slice(2));
