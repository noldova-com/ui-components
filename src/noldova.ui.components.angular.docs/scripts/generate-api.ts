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

export class GenerateApi extends Script {
  public override async runAsync(): Promise<void> {
    await new DocsPreparation(path.resolve(Config.ROOT)).generateApiAsync(process.stdout);
  }
}

const generator = new GenerateApi();
await generator.runAsEntryPointAsync();
