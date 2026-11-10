/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "node:path";

import Config from "../../noldova.ui.components.angular/scripts/config.ts";
import Script from "../../noldova.ui.components.angular/scripts/script.ts";
import { DocsPreparation } from "./docs/docs-preparation.ts";

export class BuildDocs extends Script {
  private static readonly ROOT: string = path.resolve(Config.ROOT);
  private static readonly ANGULAR_CLI_PATH: string = path.join(BuildDocs.ROOT, "node_modules/@angular/cli/bin/ng.js");
  private static readonly BUILD_ARGUMENTS: readonly string[] = ["build", "docs"];
  private static readonly OUTPUT_FOLDER: string = "../../_build/docs";
  private static readonly WORKSPACE_FOLDER: string = ".";

  public override async runAsync(): Promise<void> {
    await new DocsPreparation(BuildDocs.ROOT).prepareAsync(process.stdout);
    await this.removeDirectoryAsync(BuildDocs.OUTPUT_FOLDER);
    await this.executeProcessAsync(process.execPath, [BuildDocs.ANGULAR_CLI_PATH, ...BuildDocs.BUILD_ARGUMENTS], BuildDocs.WORKSPACE_FOLDER);
  }
}

const builder = new BuildDocs();
await builder.runAsEntryPointAsync();
