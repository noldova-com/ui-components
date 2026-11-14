/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { access, lstat, rm } from "node:fs/promises";
import path from "node:path";
import type { Writable } from "node:stream";

import { ApiException } from "../../../noldova.ui.components.angular/scripts/api/api.exception.ts";
import CommandFailedException from "../../../noldova.ui.components.angular/scripts/command-failed.exception.ts";
import { DocsApiGenerator } from "./docs-api-generator.ts";
import { DocsSourceGenerator } from "./docs-source-generator.ts";

export class DocsPreparation {
  private static readonly DEPENDENCIES_FOLDER: string = "node_modules";
  private static readonly KIT_PACKAGE: string = "@noldova/ui.components.angular";
  private static readonly MISSING_CODE: string = "ENOENT";

  private readonly root: string;

  public constructor(root: string) {
    this.root = root;
  }

  public async prepareAsync(output: Writable): Promise<void> {
    try {
      await access(path.join(this.root, DocsPreparation.DEPENDENCIES_FOLDER));
    }
    catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === DocsPreparation.MISSING_CODE))
        throw error;
      throw new CommandFailedException(`The docs site builds against the kit's source with the root's packages, which are not installed; run npm ci first.`, { cause: error });
    }
    await this.requireBuiltKitAsync();
    await rm(path.join(this.root, DocsSourceGenerator.GENERATED_FOLDER), { recursive: true, force: true });
    await this.generateApiAsync(output);
    const sources = new DocsSourceGenerator(this.root);
    const examples = await sources.writeExamplesAsync();
    const documents = await sources.writeDocumentsAsync();
    await sources.writeIndexAsync();
    await sources.writeBaseStylesAsync();
    output.write(`Wrote the sources of ${examples} examples, ${documents} kit documents, the page shell and the kit's base styles to ${DocsSourceGenerator.GENERATED_FOLDER}.\n`);
  }

  // npm links the kit's workspace at the root until npm run build:components unpacks the packed kit there, so a link, or nothing, means the kit isn't built.
  private async requireBuiltKitAsync(): Promise<void> {
    const kit = path.join(this.root, DocsPreparation.DEPENDENCIES_FOLDER, ...DocsPreparation.KIT_PACKAGE.split("/"));
    const built = await lstat(kit).then(t => t.isDirectory(), (error: unknown) => {
      if (error instanceof Error && "code" in error && error.code === DocsPreparation.MISSING_CODE)
        return false;
      throw error;
    });
    if (!built)
      throw new CommandFailedException(`The docs site needs npm run build:components first, which hasn't run: the kit isn't installed at the root.`);
  }

  public async generateApiAsync(output: Writable): Promise<void> {
    try {
      const components = await new DocsApiGenerator(this.root).writeAsync();
      output.write(`Wrote the API of ${components.length} components to ${DocsApiGenerator.MODULE_FILE}.\n`);
    }
    catch (error) {
      if (!(error instanceof ApiException))
        throw error;
      throw new CommandFailedException(`The docs site's API reference could not be read: ${error.message}`, { cause: error });
    }
  }
}
