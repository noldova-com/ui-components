/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { IVitestRun } from "../../coverage/interfaces/i-vitest-run.ts";
import type { IVitestProject } from "../interfaces/i-vitest-project.ts";

// A project whose opening of its browser page fails with the error given, as Vitest's TestProject._openBrowserPage does when the page's navigation fails.
export class OpeningProject implements IVitestProject {
  private readonly error: Error;

  public readonly vitest: IVitestRun;

  public constructor(vitest: IVitestRun, error: Error) {
    this.vitest = vitest;
    this.error = error;
  }

  public _openBrowserPage(): Promise<void> {
    return Promise.reject(this.error);
  }
}
