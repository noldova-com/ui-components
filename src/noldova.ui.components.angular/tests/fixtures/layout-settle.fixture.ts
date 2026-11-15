/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { HangLimitFixture } from "./hang-limit.fixture";

// Waits until what a spec reads of the page's layout stays the same through one more pass of the spec's own, such as a frame and a stable
// fixture. A layout that has stopped moving fires no event, and the shape it settles into isn't known before, so this polls, once a pass, and
// fails at the shared bound, naming what it waited on and the last shape it read.
export class LayoutSettleFixture {
  public static async settledAsync(what: string, shape: () => string, passAsync: () => Promise<void>,
    limit: number = HangLimitFixture.wait.timeout): Promise<void> {
    const deadline = performance.now() + limit;
    for (let last = shape(); ;) {
      await passAsync();
      const read = shape();
      if (read === last)
        return;
      if (performance.now() >= deadline)
        throw new Error(`${what} kept changing for ${limit} ms; it last read ${read}.`);
      last = read;
    }
  }
}
