/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from "node:path";

import { AngularTimingScript } from "../../noldova.ui.components.angular/scripts/angular/angular-timing-script.ts";
import Config from "../../noldova.ui.components.angular/scripts/config.ts";

import { DocsPreparation } from "./docs/docs-preparation.ts";

export class TestDocsTiming extends AngularTimingScript {
  private static readonly REPOSITORY_ROOT: string = path.resolve(Config.ROOT);
  private static readonly ANGULAR_PROJECT: string = "docs";
  private static readonly OWNER: string = "the docs site's";
  private static readonly PLATFORM: NodeJS.Platform = "linux";
  private static readonly SKIPPED_OFF_PLATFORM: string = "The docs site's timing check runs only on Linux, as its tests do; skipped.";

  public constructor() {
    super(TestDocsTiming.ANGULAR_PROJECT, TestDocsTiming.OWNER);
  }

  public override async runAsync(): Promise<void> {
    if (process.platform !== TestDocsTiming.PLATFORM) {
      await this.writeLogAsync(TestDocsTiming.SKIPPED_OFF_PLATFORM);
      return;
    }

    await new DocsPreparation(TestDocsTiming.REPOSITORY_ROOT).prepareAsync(process.stdout);
    await this.runTimingAsync();
  }
}

const timing = new TestDocsTiming();
await timing.runAsEntryPointAsync();
