/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { IBrowserPage } from "./i-browser-page.ts";
import type { IVitestProject } from "./i-vitest-project.ts";

// The part of the context Vitest's Playwright provider passes a browser command: the test page that called it, and the project whose run prints.
export interface IBrowserCommandContext {
  readonly page: IBrowserPage;
  readonly project: IVitestProject;
}
