/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { existsSync } from "node:fs";

import type { ApiPackage } from "./api-package.ts";
import { ApiProgram } from "./api-program.ts";
import { ApiProject } from "./api-project.ts";
import { ApiException } from "./api.exception.ts";

export class ApiDeclarationSession {
  private readonly root: string;

  public constructor(root: string) {
    this.root = root;
  }

  public async useAsync<T>(apiPackage: ApiPackage, purpose: string, files: readonly string[], read: (api: ApiProgram) => T): Promise<T> {
    if (!existsSync(apiPackage.declarations))
      throw new ApiException(`no declarations at ${apiPackage.declarations}`);
    const packed = apiPackage.packedDeclarations;
    if (files.includes(packed) && !existsSync(packed))
      throw new ApiException(`no packed declarations at ${packed}; build the packages first`);
    const project = new ApiProject(this.root, purpose, apiPackage.id);
    await project.writeAsync(apiPackage.project, this.root, files);
    return read(ApiProgram.open(project.file));
  }
}
