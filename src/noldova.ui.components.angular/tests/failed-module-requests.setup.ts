/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { commands } from "vitest/browser";

declare module "vitest/browser" {
  interface BrowserCommands {
    watchFailedModuleRequests: () => Promise<readonly string[]>;
    // A localhost port nothing listens on, for the spec of a request whose connection is refused.
    closedPort: () => Promise<number>;
  }
}

// Has the run print every module request the browser fails from here on, with its network error, so a spec file that fails to import says why;
// tests/network/failed-module-requests.ts listens once per page and prints nothing while every request succeeds.
await commands.watchFailedModuleRequests();
