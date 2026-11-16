/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IVitestProject } from "../../network/interfaces/i-vitest-project.ts";
import type { IScreenshotOptions } from "./i-screenshot-options.ts";
import type { ITakenScreenshot } from "./i-taken-screenshot.ts";

// The part of a browser command's context the screenshot command uses: the project whose run prints, and the provider's command that takes it.
export interface IScreenshotCommandContext {
  readonly project: IVitestProject;

  triggerCommand(command: string, name: string, options: IScreenshotOptions): Promise<ITakenScreenshot>;
}
