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
    // Marks a module URL a spec fails on purpose, so the run's closing line of failed modules leaves it out.
    expectFailedModuleRequest: (url: string) => Promise<void>;
    // A localhost port nothing listens on, for the spec of a request whose connection is refused.
    closedPort: () => Promise<number>;
    // The lines a recorder of its own prints for a refused module request with the probe named, "rejecting", "failing listing" or "hanging listing", once its run closed.
    // With isExpected, the request is marked as failing on purpose first; with count, that many requests are refused.
    scriptedRefusal: (probe: string, isExpected?: boolean, count?: number) => Promise<readonly string[]>;
    // The lines a recorder of its own prints for requests that stall in the scenario named, "crowd" or "alone", once its run closed.
    scriptedStall: (scenario: string, waitLimit?: number) => Promise<readonly string[]>;
    // The lines a recorder of its own prints for module requests failed with the network error given, count of them, and the socket census named,
    // "sample", "failing", "this machine" or "elsewhere", once its run closed.
    scriptedResourceError: (census: string, errorText: string, count?: number) => Promise<readonly string[]>;
    // What the probe read of a refused port after Node's event loop stalled past its limit: "connect", each localhost address's connect, or "listing", the listing.
    stalledProbe: (part: string) => Promise<readonly string[]>;
  }
}

// Has the run print every module request the browser fails from here on, with its network error, so a spec file that fails to import says why;
// tests/network/failed-module-requests.ts listens once per page and prints nothing while every request succeeds.
await commands.watchFailedModuleRequests();
