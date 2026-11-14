/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { Writable } from "node:stream";

import type { ApiCatalog } from "../api/api-catalog.ts";
import { ApiDeclarationSession } from "../api/api-declaration-session.ts";
import { ApiDocMerger } from "../api/api-doc-merger.ts";
import { ApiDocumentationReader } from "../api/api-documentation.reader.ts";
import type { ApiPackage } from "../api/api-package.ts";
import { ApiException } from "../api/api.exception.ts";
import type { ICheck } from "./interfaces/i-check.ts";

export class ApiDocumentationCheck implements ICheck {
  private static readonly PURPOSE: string = "api-documentation";
  private static readonly VERDICT: string = "documents every public member";

  private readonly root: string;
  private readonly catalog: ApiCatalog;
  private readonly session: ApiDeclarationSession;

  public readonly title: string = "API documentation";

  public constructor(root: string, catalog: ApiCatalog) {
    this.root = root;
    this.catalog = catalog;
    this.session = new ApiDeclarationSession(root);
  }

  public async runAsync(output: Writable): Promise<boolean> {
    return await this.catalog.inspectEachAsync(output, ApiDocumentationCheck.VERDICT, t => this.inspectAsync(t));
  }

  private async inspectAsync(apiPackage: ApiPackage): Promise<readonly string[]> {
    try {
      const packed = apiPackage.packedDeclarations;
      return await this.session.useAsync(apiPackage, ApiDocumentationCheck.PURPOSE, [apiPackage.declarations, packed], t => {
        const problems = new ApiDocumentationReader(t, this.root).read(apiPackage.declarations, apiPackage.declarations);
        const merger = new ApiDocMerger(t, this.root);
        merger.compare(apiPackage.declarations, packed);
        return [...problems, ...merger.problems];
      });
    }
    catch (error) {
      if (!(error instanceof ApiException))
        throw error;
      return [ApiException.describe(error)];
    }
  }
}
