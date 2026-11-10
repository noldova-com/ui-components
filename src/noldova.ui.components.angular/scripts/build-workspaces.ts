/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { fileURLToPath } from "node:url";

import Script from "./script.ts";

export class BuildWorkspaces extends Script {
  private static readonly ROOT: string = fileURLToPath(new URL("../../..", import.meta.url));
  private static readonly COMPONENTS_ARGUMENTS: readonly string[] = ["run", "build:components", "--"];
  private static readonly DOCS_ARGUMENTS: readonly string[] = ["run", "build:docs"];

  public override async runAsync(): Promise<void> {
    const arguments_ = process.argv.slice(2);
    await this.executeNPMCommandAsync([...BuildWorkspaces.COMPONENTS_ARGUMENTS, ...arguments_], BuildWorkspaces.ROOT);
    if (arguments_.length === 0)
      await this.executeNPMCommandAsync(BuildWorkspaces.DOCS_ARGUMENTS, BuildWorkspaces.ROOT);
  }
}

await new BuildWorkspaces().runAsEntryPointAsync();
