/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { existsSync, statSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { SourceScanner } from "../structure/source-scanner.ts";
import type { PackageManifest } from "./package-manifest.ts";

export class TestingIsolation {
  private static readonly SOURCE_FOLDER: string = "src";
  private static readonly ENTRY_FOLDER: string = "api";
  private static readonly TESTING_FOLDER: string = "testing";
  private static readonly TESTING_ENTRY: string = "testing.ts";
  private static readonly SCRIPT_EXTENSION: string = ".ts";
  private static readonly IMPORT_EXTENSION: string = ".js";
  private static readonly DECLARATIONS: string = ".d.ts";
  private static readonly INDEX_FILE: string = "index.ts";
  private static readonly RELATIVE_PREFIX: string = ".";
  private static readonly TEST_RUNNER: string = "vitest";
  private static readonly SUBPATH_SEPARATOR: string = "/";
  private static readonly MANIFEST_FILE: string = "package.json";
  private static readonly TESTING_SUBPATH: string = "./testing";
  private static readonly RULE: string = "only the testing entry, src/api/testing.ts, may take src/testing/ and vitest, so an app's bundle never takes the test helpers.";

  private readonly root: string;
  private readonly manifest: PackageManifest;

  public constructor(root: string, manifest: PackageManifest) {
    this.root = root;
    this.manifest = manifest;
  }

  public async findLeaksAsync(): Promise<readonly string[]> {
    const findings: string[] = [];
    const helpers = await this.listTestingEntriesAsync();
    const entries = this.locateSource(TestingIsolation.SOURCE_FOLDER, TestingIsolation.ENTRY_FOLDER);
    const testing = this.locateSource(TestingIsolation.SOURCE_FOLDER, TestingIsolation.TESTING_FOLDER) + path.sep;
    const names = existsSync(entries) ? (await readdir(entries)).sort() : [];
    for (const name of names.filter(t => t.endsWith(TestingIsolation.SCRIPT_EXTENSION) && !t.endsWith(TestingIsolation.DECLARATIONS) && t !== TestingIsolation.TESTING_ENTRY))
      findings.push(...await this.walkAsync(path.join(entries, name), testing, helpers));
    return findings;
  }

  private static isTestRunner(specifier: string): boolean {
    return specifier === TestingIsolation.TEST_RUNNER || specifier.startsWith(`${TestingIsolation.TEST_RUNNER}${TestingIsolation.SUBPATH_SEPARATOR}`);
  }

  private static resolve(file: string, specifier: string): string | null {
    const target = path.resolve(path.dirname(file), specifier);
    const script = target.endsWith(TestingIsolation.IMPORT_EXTENSION) ? `${target.slice(0, -TestingIsolation.IMPORT_EXTENSION.length)}${TestingIsolation.SCRIPT_EXTENSION}` : target;
    return [script, `${target}${TestingIsolation.SCRIPT_EXTENSION}`, target, path.join(target, TestingIsolation.INDEX_FILE)]
      .find(t => existsSync(t) && statSync(t).isFile()) ?? null;
  }

  private async listTestingEntriesAsync(): Promise<ReadonlySet<string>> {
    const entries = new Set<string>();
    const fields: unknown = JSON.parse(await readFile(this.locateSource(TestingIsolation.MANIFEST_FILE), "utf8"));
    const exports = typeof fields === "object" && fields !== null && "exports" in fields ? fields.exports : undefined;
    if (typeof exports === "object" && exports !== null && TestingIsolation.TESTING_SUBPATH in exports)
      entries.add(`${this.manifest.name}${TestingIsolation.TESTING_SUBPATH.slice(TestingIsolation.RELATIVE_PREFIX.length)}`);
    return entries;
  }

  private locateSource(...segments: readonly string[]): string {
    return path.join(this.root, ...this.manifest.directory.split("/"), ...segments);
  }

  private async walkAsync(entry: string, testing: string, helpers: ReadonlySet<string>): Promise<readonly string[]> {
    const findings: string[] = [];
    const found = new Set<string>([entry]);
    const pending = [entry];
    for (let file = pending.pop(); file !== undefined; file = pending.pop()) {
      if (file.startsWith(testing))
        findings.push(`${this.describe(file)}: is a test helper reached from the entry ${this.describe(entry)}; ${TestingIsolation.RULE}`);
      for (const literal of new SourceScanner(await readFile(file, "utf8")).scan().imports) {
        if (TestingIsolation.isTestRunner(literal.value))
          findings.push(`${this.describe(file)}:${literal.line}: imports ${literal.value} and is reached from the entry ${this.describe(entry)}; ${TestingIsolation.RULE}`);
        if (helpers.has(literal.value))
          findings.push(`${this.describe(file)}:${literal.line}: imports ${literal.value}, which leads to the test helpers, and is reached from the entry ${this.describe(entry)}; ${TestingIsolation.RULE}`);
        const imported = literal.value.startsWith(TestingIsolation.RELATIVE_PREFIX) ? TestingIsolation.resolve(file, literal.value) : null;
        if (imported === null || found.has(imported))
          continue;
        found.add(imported);
        pending.push(imported);
      }
    }
    return findings.sort();
  }

  private describe(file: string): string {
    return path.relative(this.root, file).split(path.sep).join(path.posix.sep);
  }
}
