/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IVitestLogger } from "../../coverage/interfaces/i-vitest-logger.ts";
import type { IVitestRun } from "../../coverage/interfaces/i-vitest-run.ts";

// A run that keeps the lines printed to it and, when closed, waits for its close listeners as Vitest's close does.
export class RecordedRun implements IVitestRun, IVitestLogger {
  private readonly closeListeners: (() => void | Promise<void>)[] = [];

  public readonly lines: string[] = [];
  public readonly logger: IVitestLogger = this;

  public log(message: string): void {
    this.lines.push(message);
  }

  public onClose(listener: () => void | Promise<void>): void {
    this.closeListeners.push(listener);
  }

  public async closeAsync(): Promise<void> {
    await Promise.all(this.closeListeners.map(t => t()));
  }
}
