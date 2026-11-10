/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "node:path";

import { ApiEntry } from "../../../noldova.ui.components.angular/scripts/api/api-entry.ts";
import { ApiPackage } from "../../../noldova.ui.components.angular/scripts/api/api-package.ts";
import { ApiProgram } from "../../../noldova.ui.components.angular/scripts/api/api-program.ts";
import { ApiProject } from "../../../noldova.ui.components.angular/scripts/api/api-project.ts";
import Config from "../../../noldova.ui.components.angular/scripts/config.ts";
import type { DocsComponent } from "./docs-component.ts";
import { DocsApiReader } from "./docs-api.reader.ts";
import { DocsModuleWriter } from "./docs-module-writer.ts";

export class DocsApiGenerator {
  public static readonly MODULE_FILE: string = "_build/docs-generated/api-reference.ts";

  private static readonly KIT_DIRECTORY: string = `src/${Config.KIT_INFO.path}`;
  private static readonly PROJECT_FILE: string = "tsconfig.json";
  private static readonly PURPOSE: string = "docs-api";
  private static readonly PROJECT_ID: string = "kit";
  private static readonly EXPORT_NAME: string = "apiReference";
  private static readonly SUBPATH_PREFIX: string = ".";

  private readonly root: string;

  public constructor(root: string) {
    this.root = root;
  }

  public async writeAsync(): Promise<readonly DocsComponent[]> {
    const base = path.join(this.root, DocsApiGenerator.KIT_DIRECTORY, DocsApiGenerator.PROJECT_FILE);
    const packageName = Config.KIT_INFO.packageName;
    const entries = (await ApiEntry.readAsync(this.root, DocsApiGenerator.KIT_DIRECTORY))
      .map(t => ({ entry: t, apiPackage: new ApiPackage(this.root, DocsApiGenerator.KIT_DIRECTORY, packageName, base, t) }));
    const project = new ApiProject(this.root, DocsApiGenerator.PURPOSE, DocsApiGenerator.PROJECT_ID);
    await project.writeAsync(base, this.root, entries.flatMap(t => [t.apiPackage.declarations, t.apiPackage.implementation]));
    const reader = new DocsApiReader(ApiProgram.open(project.file));
    const components = entries.flatMap(({ entry, apiPackage }) =>
      reader.read(apiPackage.declarations, apiPackage.implementation, DocsApiGenerator.formatEntry(packageName, entry)));
    await new DocsModuleWriter(this.root).writeAsync(DocsApiGenerator.MODULE_FILE, DocsApiGenerator.EXPORT_NAME, components);
    return components;
  }

  private static formatEntry(packageName: string, entry: ApiEntry): string {
    return entry.isMain ? packageName : `${packageName}${entry.subpath.slice(DocsApiGenerator.SUBPATH_PREFIX.length)}`;
  }
}
