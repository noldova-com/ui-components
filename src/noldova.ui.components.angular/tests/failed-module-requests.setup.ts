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
    // The lines a recorder of its own prints for a refused module request with the probe named, "rejecting", "failing listing" or "hanging listing", once its run closed.
    scriptedRefusal: (probe: string) => Promise<readonly string[]>;
    // The lines a recorder of its own prints for requests that stall in the scenario named, "crowd" or "alone", once its run closed.
    scriptedStall: (scenario: string, waitLimit?: number) => Promise<readonly string[]>;
  }
}

// Has the run print every module request the browser fails from here on, with its network error, so a spec file that fails to import says why;
// tests/network/failed-module-requests.ts listens once per page and prints nothing while every request succeeds.
await commands.watchFailedModuleRequests();
