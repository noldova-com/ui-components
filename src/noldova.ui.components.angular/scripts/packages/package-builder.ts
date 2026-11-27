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
import { PackageFile } from "./package-file.ts";

export class PackageBuilder {
  private static readonly ARCHIVE_FOLDER: string = "package";

  private readonly root: string;
  private readonly archives: ArchiveReader = new ArchiveReader();

  public constructor(root: string) {
    this.root = root;
  }

  public async listCopiesAsync(inputs: readonly string[]): Promise<readonly PackageFile[]> {
    const copies: PackageFile[] = [];
    for (const input of inputs)
      copies.push(...await PackageBuilder.listFilesAsync(input, path.basename(input)));
    return copies;
  }

  public async findArchiveDifferencesAsync(copies: readonly PackageFile[], archive: string): Promise<readonly string[]> {
    if (copies.length === 0)
      return [];
    const packed = await this.archives.readAsync(archive);
    const differences: string[] = [];
    for (const file of copies) {
      const entry = `${PackageBuilder.ARCHIVE_FOLDER}/${file.name}`;
      const copy = packed.get(entry);
      const origin = path.relative(this.root, file.source).split(path.sep).join(path.posix.sep);
      if (copy === undefined)
        differences.push(`${path.basename(archive)} lacks ${entry}, the copy of ${origin}.`);
      else if (!copy.equals(await readFile(file.source)))
        differences.push(`${path.basename(archive)} holds a ${entry} that differs from ${origin}.`);
    }
    return differences;
  }

  private static async listFilesAsync(source: string, entry: string): Promise<readonly PackageFile[]> {
    if (!(await stat(source)).isDirectory())
      return [new PackageFile(source, entry)];
    const files: PackageFile[] = [];
    for (const name of (await readdir(source, { recursive: true })).sort()) {
      const file = path.join(source, name);
      if ((await stat(file)).isFile())
        files.push(new PackageFile(file, `${entry}/${name.split(path.sep).join(path.posix.sep)}`));
    }
    return files;
  }
}
