/**
 * @license
 * Copyright (c) Noldova.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DiffPending } from "../../../src/app/models/diff-pending";

describe("DiffPending", () => {
  it("is pending, has no hunks and says the changes are loading", () => {
    const content = new DiffPending();

    expect([content.isPending, content.hunks, content.stateText]).toEqual([true, [], "Loading this file's changes…"]);
  });
});
