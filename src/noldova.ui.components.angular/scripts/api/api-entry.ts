/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { ApiException } from "./api.exception.ts";

export class ApiEntry {
  public static readonly MAIN: ApiEntry = new ApiEntry(".", "index");

  private static readonly MANIFEST_FILE: string = "package.json";
  private static readonly MISSING_CODE: string = "ENOENT";
  private static readonly EXPORTS_FIELD: string = "exports";
  private static readonly TYPES_FIELD: string = "types";
  private static readonly RELATIVE_PREFIX: string = "./";
  private static readonly TYPES_PATTERN: RegExp = /^\.\/api\/([a-z][a-z0-9-]*)\.d\.ts$/;

  public readonly subpath: string;
  public readonly name: string;

  private constructor(subpath: string, name: string) {
    this.subpath = subpath;
    this.name = name;
  }

  public get isMain(): boolean {
    return this.subpath === ApiEntry.MAIN.subpath;
  }

  public static async readAsync(root: string, directory: string): Promise<readonly ApiEntry[]> {
    const file = `${directory}/${ApiEntry.MANIFEST_FILE}`;
    let manifest: unknown;
    try {
      manifest = JSON.parse(await readFile(path.join(root, file), "utf8"));
    }
    catch (error) {
      if (!(error instanceof SyntaxError || error instanceof Error && "code" in error && error.code === ApiEntry.MISSING_CODE))
        throw error;
      throw new ApiException(`${file} could not be read as JSON, so the entries whose declarations are checked are unknown.`, { cause: error });
    }
    const fields = ApiEntry.isRecord(manifest) ? manifest : {};
    const exports = fields[ApiEntry.EXPORTS_FIELD];
    const listed: readonly (readonly [string, unknown])[] = ApiEntry.isRecord(exports)
      ? Object.entries(exports).map(([subpath, target]) => [subpath, ApiEntry.isRecord(target) ? target[ApiEntry.TYPES_FIELD] : undefined])
      : [[ApiEntry.MAIN.subpath, ApiEntry.qualify(fields[ApiEntry.TYPES_FIELD])]];
    const entries = listed.filter(([, types]) => types !== undefined).map(([subpath, types]) => ApiEntry.parse(file, subpath, types));
    if (entries.length === 0)
      throw new ApiException(`${file} exports no declarations, so its API cannot be checked.`);
    return entries;
  }

  private static isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  private static qualify(types: unknown): unknown {
    return typeof types === "string" && !types.startsWith(ApiEntry.RELATIVE_PREFIX) ? `${ApiEntry.RELATIVE_PREFIX}${types}` : types;
  }

  private static parse(file: string, subpath: string, types: unknown): ApiEntry {
    const name = typeof types === "string" ? ApiEntry.TYPES_PATTERN.exec(types)?.[1] : undefined;
    if (name === undefined)
      throw new ApiException(`${file} exports ${subpath} with the declarations ${JSON.stringify(types)}, which are not an api/<entry>.d.ts file, so they cannot be checked.`);
    return new ApiEntry(subpath, name);
  }
}
