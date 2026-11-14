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
import { JsonFields } from "./json-fields.ts";

// One kind of a file's coverage, its statements, functions or branches, keyed by where each sits in the source, so that
// parts whose reports number the same place differently still add their hits together.
class CoverageTally {
  private readonly entries: Map<string, { readonly entry: object; readonly counts: number[] }> = new Map();

  public add(key: string, entry: object, counts: readonly number[]): void {
    const known = this.entries.get(key);
    if (known === undefined) {
      this.entries.set(key, { entry, counts: [...counts] });
      return;
    }
    counts.forEach((count, index) => {
      known.counts[index] = (known.counts[index] ?? 0) + count;
    });
  }

  public get map(): Record<string, object> {
    return Object.fromEntries([...this.entries.values()].map((t, index) => [String(index), t.entry]));
  }

  public get counts(): Record<string, readonly number[]> {
    return Object.fromEntries([...this.entries.values()].map((t, index) => [String(index), t.counts]));
  }

  public get totals(): Record<string, number> {
    return Object.fromEntries([...this.entries.values()].map((t, index) => [String(index), t.counts[0] ?? 0]));
  }
}

class FileTally {
  private readonly statements: CoverageTally = new CoverageTally();
  private readonly functions: CoverageTally = new CoverageTally();
  private readonly branches: CoverageTally = new CoverageTally();

  public add(data: JsonFields): void {
    const statementMap = data.object("statementMap");
    const statementHits = data.object("s");
    for (const id of statementHits.names()) {
      const range = statementMap.object(id).toJson();
      this.statements.add(JSON.stringify(range), range, [statementHits.count(id)]);
    }
    const functionMap = data.object("fnMap");
    const functionHits = data.object("f");
    for (const id of functionHits.names()) {
      const declaration = functionMap.object(id);
      this.functions.add(JSON.stringify(declaration.object("decl").toJson()), declaration.toJson(), [functionHits.count(id)]);
    }
    const branchMap = data.object("branchMap");
    const branchHits = data.object("b");
    for (const id of branchHits.names()) {
      const branch = branchMap.object(id);
      this.branches.add(JSON.stringify([branch.object("loc").toJson(), branch.objects("locations").map(t => t.toJson())]), branch.toJson(), branchHits.counts(id));
    }
  }

  public toJson(filePath: string): object {
    return {
      path: filePath,
      statementMap: this.statements.map,
      fnMap: this.functions.map,
      branchMap: this.branches.map,
      s: this.statements.totals,
      f: this.functions.totals,
      b: this.branches.counts
    };
  }
}

export class CoverageMerge {
  private static readonly COVERAGE_FILE: string = "coverage-final.json";
  private static readonly ENCODING: BufferEncoding = "utf8";
  private static readonly MISSING_CODE: string = "ENOENT";
  private static readonly SEPARATOR: RegExp = /\\/gu;

  private readonly root: string;
  private readonly folder: string;

  public constructor(root: string, folder: string) {
    this.root = root;
    this.folder = folder;
  }

  public async mergeAsync(partsFolder: string, parts: number, output: string): Promise<void> {
    const entries = await fs.readdir(partsFolder, { withFileTypes: true }).catch((error: unknown) => {
      if (error instanceof Error && "code" in error && error.code === CoverageMerge.MISSING_CODE)
        return [];
      throw error;
    });
    const names = entries.filter(t => t.isDirectory()).map(t => t.name).sort();
    if (names.length !== parts)
      throw new CommandFailedException(CoverageMerge.partsMissing(partsFolder, names, parts));
    const files: Map<string, JsonFields[]> = new Map();
    for (const name of names) {
      const source = path.join(partsFolder, name, CoverageMerge.COVERAGE_FILE);
      const text = await fs.readFile(source, CoverageMerge.ENCODING).catch((error: unknown) => {
        throw new CommandFailedException(CoverageMerge.partUnread(name, source), { cause: error });
      });
      const report = JsonFields.parse(text, source);
      for (const key of report.names()) {
        const data = report.object(key);
        const relative = this.relativeOf(data.text("path"), source);
        files.set(relative, [...files.get(relative) ?? [], data]);
      }
    }
    const merged = Object.fromEntries([...files].map(([relative, reports]) => {
      const filePath = path.join(this.root, ...relative.split(path.posix.sep));
      const loaded = reports.filter(t => CoverageMerge.isLoaded(t));
      const tally = new FileTally();
      for (const data of loaded.length > 0 ? loaded : reports.slice(0, 1))
        tally.add(data);
      return [filePath, tally.toJson(filePath)];
    }));
    await fs.mkdir(path.dirname(output), { recursive: true });
    await fs.writeFile(output, JSON.stringify(merged), CoverageMerge.ENCODING);
  }

  private relativeOf(filePath: string, source: string): string {
    const posixPath = filePath.replace(CoverageMerge.SEPARATOR, path.posix.sep);
    const marker = `${path.posix.sep}${this.folder}${path.posix.sep}`;
    const index = posixPath.lastIndexOf(marker);
    if (index < 0)
      throw new CommandFailedException(CoverageMerge.outsideFolder(source, filePath, this.folder));
    return posixPath.slice(index + path.posix.sep.length);
  }

  // A part that never loaded a file reports it with every count at 0 and with maps read from its source rather than from the
  // code that ran, which can differ, so only the parts that loaded it add up; a file no part loaded keeps one part's report.
  private static isLoaded(data: JsonFields): boolean {
    const statements = data.object("s");
    const functions = data.object("f");
    const branches = data.object("b");
    return statements.names().some(t => statements.count(t) > 0) || functions.names().some(t => functions.count(t) > 0) || branches.names().some(t => branches.counts(t).some(u => u > 0));
  }

  private static partsMissing(folder: string, names: readonly string[], parts: number): string {
    return `${folder} holds the coverage of ${names.length} parts, not ${parts}: ${names.length === 0 ? "none" : names.join(", ")}.`;
  }

  private static partUnread(name: string, source: string): string {
    return `The coverage of part ${name} couldn't be read from ${source}.`;
  }

  private static outsideFolder(source: string, filePath: string, folder: string): string {
    return `${source} names ${filePath}, which is outside ${folder}.`;
  }
}
