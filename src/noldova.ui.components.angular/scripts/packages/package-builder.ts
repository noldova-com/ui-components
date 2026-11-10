/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

import { ArchiveReader } from "./archive.reader.ts";

export class PackageBuilder {
  private static readonly ARCHIVE_FOLDER: string = "package";

  private readonly root: string;
  private readonly archives: ArchiveReader = new ArchiveReader();

  public constructor(root: string) {
    this.root = root;
  }

  public async listCopiesAsync(inputs: readonly string[]): Promise<readonly (readonly [string, string])[]> {
    const copies: (readonly [string, string])[] = [];
    for (const input of inputs)
      copies.push(...await PackageBuilder.listFilesAsync(input, path.basename(input)));
    return copies;
  }

  public async findArchiveDifferencesAsync(copies: readonly (readonly [string, string])[], archive: string): Promise<readonly string[]> {
    if (copies.length === 0)
      return [];
    const packed = await this.archives.readAsync(archive);
    const differences: string[] = [];
    for (const [file, name] of copies) {
      const entry = `${PackageBuilder.ARCHIVE_FOLDER}/${name}`;
      const copy = packed.get(entry);
      const origin = path.relative(this.root, file).split(path.sep).join(path.posix.sep);
      if (copy === undefined)
        differences.push(`${path.basename(archive)} lacks ${entry}, the copy of ${origin}.`);
      else if (!copy.equals(await readFile(file)))
        differences.push(`${path.basename(archive)} holds a ${entry} that differs from ${origin}.`);
    }
    return differences;
  }

  private static async listFilesAsync(source: string, entry: string): Promise<readonly (readonly [string, string])[]> {
    if (!(await stat(source)).isDirectory())
      return [[source, entry]];
    const files: (readonly [string, string])[] = [];
    for (const name of (await readdir(source, { recursive: true })).sort()) {
      const file = path.join(source, name);
      if ((await stat(file)).isFile())
        files.push([file, `${entry}/${name.split(path.sep).join(path.posix.sep)}`]);
    }
    return files;
  }
}
