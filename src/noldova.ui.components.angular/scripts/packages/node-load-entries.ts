/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import "@noldova/context.core";

import { JsonFields } from "../angular/json-fields.ts";
import type { PackageManifest } from "./package-manifest.ts";

export class NodeLoadEntries {
  private static readonly MANIFEST_FILE: string = "package.json";
  private static readonly EXPORTS_FIELD: string = "exports";
  private static readonly MAIN_SUBPATH: string = ".";
  private static readonly RELATIVE_PREFIX: string = ".";
  private static readonly TYPES_FIELD: string = "types";
  private static readonly SKIPPED: readonly string[] = ["./testing"];
  private static readonly LOAD: RegExp = /await import\("([^"]+)"\);/g;
  private static readonly RULE: string = "the build loads every entry of the kit's package.json exports but the testing entry in Node.js, each with its own await import, as the README, Build and test, says.";

  private readonly root: string;
  private readonly manifest: PackageManifest;
  private readonly script: string;

  public constructor(root: string, manifest: PackageManifest, script: string) {
    this.root = root;
    this.manifest = manifest;
    this.script = script;
  }

  public async findDifferencesAsync(): Promise<readonly string[]> {
    const manifest = path.join(this.root, ...this.manifest.directory.split("/"), NodeLoadEntries.MANIFEST_FILE);
    const listed = this.describe(manifest);
    const entries = this.listEntries(JsonFields.parse(await readFile(manifest, "utf8"), listed).object(NodeLoadEntries.EXPORTS_FIELD));
    const loaded = new Set([...(await readFile(this.script, "utf8")).matchAll(NodeLoadEntries.LOAD)].flatMap(t => Object.isString(t[1]) ? [t[1]] : []));
    const shown = this.describe(this.script);
    return [
      ...[...entries].filter(t => !loaded.has(t)).map(t => `${shown}: loads no ${t}, though ${listed} exports it; ${NodeLoadEntries.RULE}`),
      ...[...loaded].filter(t => !entries.has(t)).map(t => `${shown}: loads ${t}, which isn't an entry ${listed} exports with declarations, or is the testing entry; ${NodeLoadEntries.RULE}`)
    ];
  }

  private listEntries(exports: JsonFields): ReadonlySet<string> {
    const targets = exports.toJson();
    return new Set(exports.names()
      .filter(t => !NodeLoadEntries.SKIPPED.includes(t) && Object.isObject(Reflect.get(targets, t)) && exports.object(t).has(NodeLoadEntries.TYPES_FIELD))
      .map(t => t === NodeLoadEntries.MAIN_SUBPATH ? this.manifest.name : `${this.manifest.name}${t.slice(NodeLoadEntries.RELATIVE_PREFIX.length)}`));
  }

  private describe(file: string): string {
    return path.relative(this.root, file).split(path.sep).join(path.posix.sep);
  }
}
