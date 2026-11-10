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

export class AngularCoverageReport {
  private static readonly ENCODING: BufferEncoding = "utf8";

  private readonly folder: string;
  private readonly file: string;
  private readonly owner: string;

  public constructor(folder: string, file: string, owner: string) {
    this.folder = folder;
    this.file = file;
    this.owner = owner;
  }

  public get path(): string {
    return path.resolve(this.file);
  }

  public async listUnhitAsync(): Promise<readonly string[]> {
    const text = await fs.readFile(this.path, AngularCoverageReport.ENCODING).catch(() => null);
    if (text === null)
      return [];
    try {
      const report = JsonFields.parse(text, this.file);
      const unhit = report.names().flatMap(t => this.unhitIn(report.object(t)));
      return unhit.length === 0 ? [] : [this.unhitCoverage(unhit.length), ...unhit.map(t => `  ${t}`)];
    }
    catch (error) {
      return [this.unreadableCoverage(error instanceof Error ? error.message : String(error))];
    }
  }

  private unhitIn(data: JsonFields): readonly string[] {
    const file = path.relative(this.folder, data.text("path")).split(path.sep).join(path.posix.sep);
    const at = (start: JsonFields): string => `${file}:${start.count("line")}:${start.count("column") + 1}`;
    const unhit: string[] = [];
    const functions = data.object("f");
    for (const id of functions.names().filter(t => functions.count(t) === 0)) {
      const declaration = data.object("fnMap").object(id);
      unhit.push(`function ${declaration.text("name")} at ${at(declaration.object("decl").object("start"))}`);
    }
    const statements = data.object("s");
    for (const id of statements.names().filter(t => statements.count(t) === 0))
      unhit.push(`statement at ${at(data.object("statementMap").object(id).object("start"))}`);
    const branches = data.object("b");
    for (const id of branches.names()) {
      const branch = data.object("branchMap").object(id);
      const locations = branch.objects("locations");
      branches.counts(id).forEach((count, index) => {
        const start = locations[index]?.object("start");
        const branchPlace = start?.has("line") === true && start.has("column") ? start : branch.object("loc").object("start");
        if (count === 0)
          unhit.push(`branch ${index + 1} at ${at(branchPlace)}`);
      });
    }
    return unhit;
  }

  private unhitCoverage(count: number): string {
    return `${this.owner} specs never reached ${count} functions, statements and branches:`;
  }

  private unreadableCoverage(reason: string): string {
    return `${this.owner} per-file coverage report couldn't be read, so what its specs never reached isn't named: ${reason}`;
  }
}
