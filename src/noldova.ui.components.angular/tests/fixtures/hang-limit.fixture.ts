/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { server } from "vitest/browser";

// A poll carries no limit of its own: every vi.waitFor waits up to the run's one hang limit, which vitest.config.mts sets, so only that limit
// ends a hung poll, and the test that reached it is named. expect.poll takes the same limit from vitest.config.mts.
export class HangLimitFixture {
  public static readonly wait: { readonly timeout: number } = { timeout: server.config.testTimeout };
}
