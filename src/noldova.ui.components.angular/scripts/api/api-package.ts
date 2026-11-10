/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "node:path";

import { ApiEntry } from "./api-entry.ts";

export class ApiPackage {
  private static readonly SOURCE_FOLDER: string = "src";
  private static readonly ENTRY_FOLDER: string = "api";
  private static readonly DEPENDENCY_FOLDER: string = "node_modules";
  private static readonly IMPLEMENTATION_EXTENSION: string = ".ts";
  private static readonly DECLARATIONS_EXTENSION: string = ".d.ts";

  public readonly title: string;
  public readonly id: string;
  public readonly project: string;
  public readonly implementation: string;
  public readonly declarations: string;
  public readonly packedDeclarations: string;

  public constructor(root: string, directory: string, packageName: string, project: string, entry: ApiEntry = ApiEntry.MAIN) {
    const source = path.join(root, ...directory.split("/"), ApiPackage.SOURCE_FOLDER, ApiPackage.ENTRY_FOLDER);
    this.title = entry.isMain ? directory : `${directory} (${entry.subpath})`;
    const id = directory.split("/").slice(1).join("-");
    this.id = entry.isMain ? id : `${id}-${entry.name}`;
    this.project = project;
    this.implementation = path.join(source, `${entry.name}${ApiPackage.IMPLEMENTATION_EXTENSION}`);
    this.declarations = path.join(source, `${entry.name}${ApiPackage.DECLARATIONS_EXTENSION}`);
    this.packedDeclarations = path.join(root, ApiPackage.DEPENDENCY_FOLDER, ...packageName.split("/"), ApiPackage.ENTRY_FOLDER,
      `${entry.name}${ApiPackage.DECLARATIONS_EXTENSION}`);
  }
}
