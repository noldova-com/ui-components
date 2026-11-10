/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "node:path";
import type { Writable } from "node:stream";

import type PackageInfo from "../package-info.ts";
import { ApiEntry } from "./api-entry.ts";
import { ApiPackage } from "./api-package.ts";
import { ApiException } from "./api.exception.ts";

export class ApiCatalog {
  private static readonly SOURCE_FOLDER: string = "src";
  private static readonly PROJECT_FILE: string = "tsconfig.json";

  private readonly root: string;
  private readonly kit: PackageInfo;

  public constructor(root: string, kit: PackageInfo) {
    this.root = root;
    this.kit = kit;
  }

  public async listAsync(): Promise<readonly ApiPackage[]> {
    const directory = `${ApiCatalog.SOURCE_FOLDER}/${this.kit.path}`;
    const project = path.join(this.root, directory, ApiCatalog.PROJECT_FILE);
    return (await ApiEntry.readAsync(this.root, directory)).map(t => new ApiPackage(this.root, directory, this.kit.packageName, project, t));
  }

  public async inspectEachAsync(output: Writable, verdict: string, inspectAsync: (apiPackage: ApiPackage) => Promise<readonly string[]>): Promise<boolean> {
    let apiPackages: readonly ApiPackage[];
    try {
      apiPackages = await this.listAsync();
    }
    catch (error) {
      if (!(error instanceof ApiException))
        throw error;
      output.write(`${error.message}\n`);
      return false;
    }
    let passed = true;
    for (const apiPackage of apiPackages) {
      const problems = await inspectAsync(apiPackage);
      output.write(problems.length === 0 ? `${apiPackage.title}: ${verdict}\n` : `${apiPackage.title}:\n${problems.map(t => `  ${t}\n`).join("")}`);
      passed &&= problems.length === 0;
    }
    return passed;
  }
}
