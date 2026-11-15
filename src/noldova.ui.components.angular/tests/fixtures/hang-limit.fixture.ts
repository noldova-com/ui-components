/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { server } from "vitest/browser";

// vi.waitFor takes no bound from the config, so every call passes this one: expect.poll's bound from vitest.config.mts, below the test's limit.
export class HangLimitFixture {
  public static readonly wait: { readonly timeout: number } = { timeout: HangLimitFixture.readPollLimit() };

  private static readPollLimit(): number {
    const limit = server.config.expect.poll?.timeout;
    if (limit === undefined)
      throw new Error("vitest.config.mts sets no expect.poll timeout, the bound of every poll in the specs.");
    return limit;
  }
}
