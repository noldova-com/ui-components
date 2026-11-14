/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { AngularTimingScript } from "./angular/angular-timing-script.ts";

export class TestTiming extends AngularTimingScript {
  private static readonly ANGULAR_PROJECT: string = "components";
  private static readonly OWNER: string = "the kit's";

  public constructor() {
    super(TestTiming.ANGULAR_PROJECT, TestTiming.OWNER);
  }

  public override async runAsync(): Promise<void> {
    await this.runTimingAsync();
  }
}

const timing = new TestTiming();
await timing.runAsEntryPointAsync();
